/*
 * Photos for Proton
 * Copyright (C) 2026 Akoos <https://akoos.eu>
 *
 * Source:  https://github.com/PhotosforProton/photos-desktop
 * Website: https://www.photosforproton.eu
 *
 * This file is part of Photos for Proton.
 *
 * Photos for Proton is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type WheelEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { rpc } from "../lib/rpc";
import { Avatar } from "../components/Avatar";
import { ProfileMenu, type Account } from "../components/ProfileMenu";
import { Settings, DEFAULT_SETTINGS, type AppSettings } from "./Settings";
import { applyTheme } from "../lib/theme";
import { Albums, type Album } from "./Albums";
import { Shared, type Tab } from "./Shared";
import { ChevronLeftIcon, UploadArrowIcon, FilterIcon } from "../components/icons";
import { Upload } from "../components/Upload";
import { Lightbox } from "../components/Lightbox";
import { Confirm } from "../components/Confirm";
import { FilterPanel, type MediaType } from "../components/FilterPanel";
import { PhotoGrid, PhotoGridSkeleton } from "../components/PhotoGrid";
import { cachedThumbnail } from "../lib/thumbStore";
import { DebugHud } from "../components/DebugHud";
import { Marquee, SelectionBar, useSelection } from "../hooks/useSelection";
import { CATEGORIES, TAG } from "../lib/tags";
import { useUploads } from "../hooks/useUploads";
import { useT } from "../lib/i18n";
import { dropPreview, prefetchPreviews } from "../lib/previewStore";
import "../styles/Photos.css";

/** How many neighbours on each side of the open photo to warm in advance. */
const PREFETCH_RADIUS = 2;

type TimelineItem = { uid: string; captureTime: number; tags: number[] };
type NodeMeta = { name: string; mediaType: string | null };
type View = "photos" | "albums" | "shared";

/** Quick media-type filters for the search bar. Matched against `mediaType`. */
const TYPES = [
  { key: "image", labelKey: "filter.images" },
  { key: "video", labelKey: "filter.videos" },
];

// Desktop is wide, so use a size-based grid: cells stay small, many per row.
// Zoom changes the minimum cell width (in px). Default = small.
const CELL_SIZES = [92, 116, 148, 190, 248];
const DEFAULT_ZOOM = 1;

function monthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}`;
}
function monthLabel(ts: number): string {
  return new Date(ts).toLocaleDateString(navigator.language || "en", {
    month: "long",
    year: "numeric",
  });
}

export function Photos({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const t = useT();
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  // Timeline content filter (view state, not persisted): multi-select categories
  // combined OR, plus a single media type. Both drive the grid in real time.
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [mediaType, setMediaType] = useState<MediaType>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [view, setView] = useState<View>("photos");
  // Lifted so the open album's header can share the top bar row.
  const [albumOpen, setAlbumOpen] = useState<Album | null>(null);
  // Lifted so the Shared by-me / with-me toggle can live in the top bar row too.
  const [sharedTab, setSharedTab] = useState<Tab>("by");
  const [sharedCount, setSharedCount] = useState<number | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const [confirmTrash, setConfirmTrash] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Escape belongs to the lightbox while it is open.
  const sel = useSelection(scrollRef, lightboxIdx === null);
  const { selected } = sel;

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [meta, setMeta] = useState<Record<string, NodeMeta>>({});
  const [indexing, setIndexing] = useState(false);
  const indexStarted = useRef(false);

  // Once the timeline has loaded (the sidecar is signed in), fill the Explorer
  // "Proton Photos" folder with cloud-photo placeholders. Once per session.
  const mountPopulated = useRef(false);
  useEffect(() => {
    if (!mountPopulated.current && items.length > 0) {
      mountPopulated.current = true;
      void invoke("populate_mount").catch(() => {});
    }
  }, [items.length]);

  // Which photos are kept offline (hydrated placeholders) so the grid can badge
  // them. Polled, because Explorer can hydrate/free them independently of the app.
  const [localUids, setLocalUids] = useState<Set<string>>(new Set());
  useEffect(() => {
    let active = true;
    const poll = async () => {
      const uids = await invoke<string[]>("hydrated_uids").catch(() => [] as string[]);
      if (active) setLocalUids(new Set(uids));
    };
    void poll();
    const id = setInterval(poll, 4000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // The single sidecar serves one request at a time, so the background warmer must
  // yield to more urgent work. It pauses while a photo is open (its full-res load) or
  // while the Explorer mount is populating/hydrating (a "mount-busy" signal from Rust),
  // so those own the channel and never wait behind a warm batch.
  const lightboxOpenRef = useRef(false);
  useEffect(() => {
    lightboxOpenRef.current = lightboxIdx !== null;
  }, [lightboxIdx]);

  const mountBusyRef = useRef(false);
  useEffect(() => {
    const un = listen<boolean>("mount-busy", (e) => {
      mountBusyRef.current = !!e.payload;
    });
    return () => {
      void un.then((f) => f());
    };
  }, []);

  // Warm the whole thumbnail cache in the background so scrolling to any month is
  // instant instead of decrypting on demand. Gentle: small batches with a pause
  // between, and it stands aside whenever something more urgent needs the sidecar.
  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    const uids = items.map((it) => it.uid);
    (async () => {
      const BATCH = 12;
      for (let i = 0; i < uids.length && !cancelled; i += BATCH) {
        // Stand aside while a photo is open or the mount is hydrating.
        while (!cancelled && (lightboxOpenRef.current || mountBusyRef.current)) {
          await new Promise((r) => setTimeout(r, 300));
        }
        if (cancelled) break;
        try {
          await rpc("getThumbnails", { uids: uids.slice(i, i + BATCH) });
        } catch {
          /* keep warming the rest */
        }
        await new Promise((r) => setTimeout(r, 400)); // yield to on-screen requests
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [items.length]);

  const [account, setAccount] = useState<Account | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [albumMembers, setAlbumMembers] = useState<Set<string>>(new Set());

  const [uploadOpen, setUploadOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Stable identity, so the upload poller is not restarted on every render.
  const onUploaded = useCallback(() => setReloadKey((k) => k + 1), []);
  const uploads = useUploads(onUploaded);

  // The tray "Sync now" button asks the open window to reload its data (timeline,
  // albums, account), like a manual refresh.
  useEffect(() => {
    const un = listen("refresh-view", () => setReloadKey((k) => k + 1));
    return () => {
      void un.then((f) => f());
    };
  }, []);

  // A brief confirmation toast (download results) that clears itself.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  // Account identity and Drive storage, for the avatar arc and the profile menu.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const info = await rpc<Account>("getAccountInfo");
        if (!cancelled) setAccount(info);
      } catch {
        /* the avatar falls back to the email initial */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await invoke<string | null>("store_get", { name: "settings" });
        if (!raw) return;
        const merged: AppSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        setSettings(merged);
        applyTheme(merged.theme, merged.palette);
      } catch {
        /* fall back to defaults */
      }
    })();
  }, []);

  function updateSettings(next: AppSettings) {
    setSettings(next);
    void invoke("store_set", { name: "settings", value: JSON.stringify(next) }).catch(() => {});
  }

  // Album membership costs a walk over every album, so only resolve it when the
  // hide setting is actually on. Android takes the same "zero cost when off" path.
  useEffect(() => {
    if (!settings.hideAlbumPhotos) {
      setAlbumMembers(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const uids = await rpc<string[]>("getAlbumPhotoUids");
        if (!cancelled) setAlbumMembers(new Set(uids));
      } catch {
        /* nothing is hidden if membership cannot be resolved */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [settings.hideAlbumPhotos, reloadKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const timeline = await rpc<TimelineItem[]>("getTimeline");
        if (cancelled) return;
        setItems(timeline);
        setLoading(false);
        // Thumbnails now load lazily per visible cell (see thumbStore), so a
        // large library no longer pulls every thumbnail into memory up front.
      } catch (e) {
        if (!cancelled) {
          setError(String(e));
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // Re-runs after an upload so new photos appear without a restart.
  }, [reloadKey]);

  // The SDK has no server-side search, so we build a local index of names and
  // media types. It streams in batches, on first use, and results appear as it
  // fills rather than blocking the grid.
  useEffect(() => {
    if (!searchOpen || indexStarted.current || items.length === 0) return;
    indexStarted.current = true;
    let cancelled = false;

    (async () => {
      setIndexing(true);
      const BATCH = 150; // the SDK batches node lookups server side
      for (let i = 0; i < items.length && !cancelled; i += BATCH) {
        const uids = items.slice(i, i + BATCH).map((t) => t.uid);
        try {
          const res = await rpc<{ uid: string; name: string; mediaType: string | null }[]>(
            "getMetadata",
            { uids },
          );
          if (cancelled) return;
          setMeta((prev) => {
            const next = { ...prev };
            for (const r of res) next[r.uid] = { name: r.name, mediaType: r.mediaType };
            return next;
          });
        } catch {
          /* one bad batch must not stop the rest */
        }
      }
      if (!cancelled) setIndexing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [searchOpen, items]);

  const toggleCategory = useCallback((key: string) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const resetFilter = useCallback(() => {
    setCategories(new Set());
    setMediaType("all");
  }, []);

  const activeFilterCount = categories.size + (mediaType === "all" ? 0 : 1);
  const query_ = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    // Categories are multi-select: an item matches if it carries a tag from ANY
    // selected category (OR) — the same union a single category already forms over
    // its own tag list (e.g. Live = Live + Motion photos).
    const selectedCats = CATEGORIES.filter((c) => categories.has(c.key));
    let base =
      selectedCats.length > 0
        ? items.filter((it) => selectedCats.some((cat) => it.tags?.some((tg) => cat.tags.includes(tg))))
        : items;

    // Android parity: the album-hide only applies to the unfiltered timeline. A
    // category selection (Favorites, Videos, ...) deliberately bypasses it.
    if (selectedCats.length === 0 && settings.hideAlbumPhotos && albumMembers.size > 0) {
      base = base.filter((it) => !albumMembers.has(it.uid));
    }

    // Media type reads straight off the tags the timeline already carries, so it
    // needs no metadata index: a Video tag marks a video, everything else a photo.
    if (mediaType === "video") base = base.filter((it) => it.tags?.includes(TAG.Video));
    else if (mediaType === "photo") base = base.filter((it) => !it.tags?.includes(TAG.Video));

    if (typeFilter) {
      base = base.filter((it) => (meta[it.uid]?.mediaType ?? "").startsWith(`${typeFilter}/`));
    }
    if (query_) {
      base = base.filter((it) => {
        const m = meta[it.uid];
        if (!m) return false; // not indexed yet
        return m.name.toLowerCase().includes(query_) || (m.mediaType ?? "").toLowerCase().includes(query_);
      });
    }
    return base;
  }, [items, categories, mediaType, typeFilter, query_, meta, settings.hideAlbumPhotos, albumMembers]);

  const sections = useMemo(() => {
    const map = new Map<string, { label: string; items: TimelineItem[] }>();
    for (const it of filtered) {
      const k = monthKey(it.captureTime);
      let s = map.get(k);
      if (!s) {
        s = { label: monthLabel(it.captureTime), items: [] };
        map.set(k, s);
      }
      s.items.push(it);
    }
    return [...map.values()];
  }, [filtered]);

  /** Drop a trashed photo from the grid and keep the lightbox on a valid item. */
  function handleTrashed(uid: string) {
    setItems((prev) => prev.filter((it) => it.uid !== uid));
    setLightboxIdx((i) => {
      if (i === null) return null;
      const remaining = filtered.length - 1;
      if (remaining <= 0) return null;
      return Math.min(i, remaining - 1);
    });
  }

  function handleRenamed(uid: string, name: string) {
    setMeta((m) => ({ ...m, [uid]: { name, mediaType: m[uid]?.mediaType ?? null } }));
  }

  // The SDK offers no prefetch, so we warm the neighbours ourselves. The sidecar
  // serves repeats from its encrypted on-disk cache, so this is cheap.
  useEffect(() => {
    if (lightboxIdx === null) return;
    const uids: string[] = [];
    for (let d = 1; d <= PREFETCH_RADIUS; d++) {
      const next = filtered[lightboxIdx + d];
      const prev = filtered[lightboxIdx - d];
      if (next) uids.push(next.uid);
      if (prev) uids.push(prev.uid);
    }
    prefetchPreviews(uids);
  }, [lightboxIdx, filtered]);

  async function trashSelected() {
    const uids = [...selected];
    if (uids.length === 0) return;
    try {
      const results = await rpc<{ uid: string; ok: boolean }[]>("trashPhotos", { uids });
      const gone = new Set(results.filter((r) => r.ok).map((r) => r.uid));
      gone.forEach(dropPreview);
      setItems((prev) => prev.filter((it) => !gone.has(it.uid)));
      sel.clear();
    } catch (e) {
      setError(String(e));
    }
  }

  // "Download" = keep the selected photos offline: pin their Explorer placeholders,
  // which the OS hydrates in place. One entry per photo, ending as a green check —
  // no duplicate file, no "waiting to sync".
  async function downloadSelected() {
    const all = [...selected];
    if (all.length === 0) return;
    // Skip photos that are already offline; re-selecting a downloaded one is a no-op.
    const uids = all.filter((u) => !localUids.has(u));
    if (uids.length === 0) {
      setToast(t("download.alreadyOffline"));
      sel.clear();
      return;
    }
    setDownloading(true);
    try {
      await invoke("pin_selected", { uids });
      sel.clear();
      setToast(t("download.done", { count: uids.length }));
    } catch (e) {
      setToast(String(e));
    } finally {
      setDownloading(false);
    }
  }

  // Remove the local copy of the selected photos (dehydrate back to cloud-only).
  async function freeUpSelected() {
    const uids = [...selected].filter((u) => localUids.has(u));
    if (uids.length === 0) {
      setToast(t("download.notDownloaded"));
      sel.clear();
      return;
    }
    try {
      await invoke("free_up_selected", { uids });
      sel.clear();
      setToast(t("download.freedUp", { count: uids.length }));
    } catch (e) {
      setToast(String(e));
    }
  }

  /** A click on a tile: ignore the one a drag emits, otherwise select or open. */
  function onCellClick(uid: string) {
    if (sel.wasDragging()) return;
    if (selected.size > 0) sel.toggle(uid);
    else setLightboxIdx(filtered.findIndex((f) => f.uid === uid));
  }

  function onWheel(e: WheelEvent) {
    if (!e.ctrlKey) return;
    e.preventDefault();
    setZoom((z) => Math.min(4, Math.max(0, e.deltaY > 0 ? z - 1 : z + 1)));
  }

  const cellSize = CELL_SIZES[zoom];
  const showBadges = zoom >= 1;

  const current = lightboxIdx !== null ? filtered[lightboxIdx] : null;

  return (
    <div className="gallery">
      <div className="g-topbar">
        {view === "photos" && (
          <>
            <button
              className={`g-filterpill ${activeFilterCount > 0 ? "active" : ""}`}
              onClick={() => setFilterOpen((o) => !o)}
              title={t("filter.title")}
            >
              <FilterIcon size={13} />
              <span>{activeFilterCount > 0 ? t("filter.title") : t("photos.all")}</span>
              {activeFilterCount > 0 && <span className="g-filterbadge">{activeFilterCount}</span>}
              <span className="g-filtercount">{filtered.length}</span>
            </button>
            <button
              className={`g-iconbtn ${searchOpen ? "sel" : ""}`}
              title={t("photos.search")}
              onClick={() => setSearchOpen((s) => !s)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 10 L14 14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <div className="g-spacer" />
            <div className="g-zoom">
              <button title={t("photos.smaller")} onClick={() => setZoom((z) => Math.max(0, z - 1))} disabled={zoom === 0}>
                −
              </button>
              <button title={t("photos.bigger")} onClick={() => setZoom((z) => Math.min(4, z + 1))} disabled={zoom === 4}>
                +
              </button>
            </div>
          </>
        )}
        {view === "albums" && albumOpen && (
          <>
            <button className="g-back" onClick={() => setAlbumOpen(null)} title={t("albums.backToAlbums")}>
              <ChevronLeftIcon />
              {t("nav.albums")}
            </button>
            <span className="g-crumbtitle">{albumOpen.name || t("albums.untitled")}</span>
            <span className="g-monthcount">
              {t(albumOpen.photoCount === 1 ? "common.photoCount.one" : "common.photoCount.other", {
                count: albumOpen.photoCount,
              })}
            </span>
          </>
        )}
        {view === "shared" && (
          <>
            <button
              className={`g-chip ${sharedTab === "by" ? "sel" : ""}`}
              onClick={() => setSharedTab("by")}
            >
              {t("shared.byMe")}
            </button>
            <button
              className={`g-chip ${sharedTab === "with" ? "sel" : ""}`}
              onClick={() => setSharedTab("with")}
            >
              {t("shared.withMe")}
            </button>
            {sharedCount != null && <span className="g-monthcount">{sharedCount}</span>}
          </>
        )}
        {view !== "photos" && <div className="g-spacer" />}
        <button
          className={`g-uploadbtn ${uploads.running ? "busy" : ""}`}
          onClick={() => setUploadOpen(true)}
          title={
            uploads.running
              ? t("photos.uploadingProgress", { progress: uploads.progressLabel })
              : t("photos.uploadTitle")
          }
        >
          <span className="g-uparrow">
            <UploadArrowIcon />
          </span>
          {uploads.running ? uploads.progressLabel : t("upload.title")}
        </button>
        <Avatar
          initial={account?.initial ?? email.charAt(0).toUpperCase()}
          storageFraction={account && account.maxSpace > 0 ? account.usedSpace / account.maxSpace : 0}
          uploading={uploads.running}
          syncing={loading && !uploads.running}
          onClick={() => setMenuOpen((o) => !o)}
          onArrowClick={() => setUploadOpen(true)}
        />
      </div>

      {menuOpen && (
        <ProfileMenu
          account={account}
          onClose={() => setMenuOpen(false)}
          onSettings={() => {
            setMenuOpen(false);
            setSettingsOpen(true);
          }}
          onSignOut={() => {
            setMenuOpen(false);
            onSignOut();
          }}
        />
      )}

      {settingsOpen && (
        <Settings
          settings={settings}
          onChange={updateSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {view === "photos" && filterOpen && (
        <FilterPanel
          categories={categories}
          onToggleCategory={toggleCategory}
          mediaType={mediaType}
          onMediaType={setMediaType}
          activeCount={activeFilterCount}
          onReset={resetFilter}
          onClose={() => setFilterOpen(false)}
        />
      )}

      {view === "photos" && searchOpen && (
        <div className="g-searchbar">
          <input
            autoFocus
            className="g-searchinput"
            placeholder={t("photos.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setQuery("");
                setSearchOpen(false);
              }
            }}
          />
          {TYPES.map((ty) => (
            <button
              key={ty.key}
              className={`g-chip ${typeFilter === ty.key ? "sel" : ""}`}
              onClick={() => setTypeFilter(typeFilter === ty.key ? null : ty.key)}
            >
              {t(ty.labelKey)}
            </button>
          ))}
          {indexing && (
            <span className="g-indexing">
              {t("photos.indexing", { done: Object.keys(meta).length, total: items.length })}
            </span>
          )}
          <button
            className="g-iconbtn"
            title={t("photos.closeSearch")}
            onClick={() => {
              setQuery("");
              setTypeFilter(null);
              setSearchOpen(false);
            }}
          >
            ✕
          </button>
        </div>
      )}

      {view === "photos" && (
        <div className="g-catrail">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`g-chip ${categories.has(c.key) ? "sel" : ""}`}
              onClick={() => toggleCategory(c.key)}
            >
              {t(`category.${c.key}`)}
            </button>
          ))}
        </div>
      )}

      {/* Albums and Shared run their own selection, so only bind ours here. */}
      <div
        className="g-scroll"
        ref={scrollRef}
        onWheel={onWheel}
        {...(view === "photos" ? sel.containerProps : {})}
      >
        {view === "albums" ? (
          <Albums
            cellSize={cellSize}
            open={albumOpen}
            onOpenChange={setAlbumOpen}
            localUids={localUids}
          />
        ) : view === "shared" ? (
          <Shared cellSize={cellSize} tab={sharedTab} onCount={setSharedCount} />
        ) : (
          <>
            {error && <div className="g-error">{error}</div>}

            {loading && items.length === 0 && <PhotoGridSkeleton count={30} cellSize={cellSize} />}

            {!loading && filtered.length === 0 && (
              <div className="g-empty">
                <p className="g-empty-title">
                  {activeFilterCount > 0 || query_ || typeFilter ? t("photos.noMatches") : t("photos.noPhotos")}
                </p>
                {!(activeFilterCount > 0 || query_ || typeFilter) && (
                  <p className="g-empty-sub">{t("photos.noPhotosSub")}</p>
                )}
                {(query_ || typeFilter) && indexing && (
                  <p className="g-empty-sub">{t("photos.stillIndexing")}</p>
                )}
              </div>
            )}

            {sections.map((s, i) => (
              <section className="g-section" key={i}>
                <div className="g-monthhdr">
                  <span className="g-monthtitle">{s.label}</span>
                  <span className="g-monthcount">
                    {t(s.items.length === 1 ? "common.photoCount.one" : "common.photoCount.other", {
                      count: s.items.length,
                    })}
                  </span>
                </div>
                <PhotoGrid
                  items={s.items}
                  cellSize={cellSize}
                  selected={selected}
                  onToggle={sel.toggle}
                  onOpen={onCellClick}
                  showBadges={showBadges}
                  renderOverlay={(item) =>
                    localUids.has(item.uid) ? (
                      <span className="g-local" title={t("photos.offline")}>
                        ☁
                      </span>
                    ) : null
                  }
                />
              </section>
            ))}
          </>
        )}
      </div>

      <div className="g-dock">
        <button className={`g-tab ${view === "photos" ? "sel" : ""}`} onClick={() => setView("photos")}>
          {t("nav.photos")}
        </button>
        <button className={`g-tab ${view === "albums" ? "sel" : ""}`} onClick={() => setView("albums")}>
          {t("nav.albums")}
        </button>
        <button className={`g-tab ${view === "shared" ? "sel" : ""}`} onClick={() => setView("shared")}>
          {t("nav.shared")}
        </button>
      </div>

      {settings.debug && <DebugHud itemCount={items.length} />}

      {loading && items.length > 0 && view === "photos" && (
        <div className="g-loadhint">{t("photos.loadingThumbnails")}</div>
      )}

      <Marquee rect={sel.marquee} />

      <SelectionBar
        count={selected.size}
        onCancel={sel.clear}
        onDownload={() => void downloadSelected()}
        onFreeUp={() => void freeUpSelected()}
        onTrash={() => setConfirmTrash(true)}
      />

      {(downloading || toast) && (
        <div className="g-toast">{downloading ? t("download.running") : toast}</div>
      )}

      {confirmTrash && (
        <Confirm
          title={t("confirm.trashTitle")}
          message={t(
            selected.size === 1 ? "confirm.trashCount.one" : "confirm.trashCount.other",
            { count: selected.size },
          )}
          confirmLabel={t("confirm.trashConfirm")}
          danger
          onCancel={() => setConfirmTrash(false)}
          onConfirm={() => {
            setConfirmTrash(false);
            void trashSelected();
          }}
        />
      )}

      {current && (
        <Lightbox
          uid={current.uid}
          isLocal={localUids.has(current.uid)}
          fallbackUrl={cachedThumbnail(current.uid) ?? null}
          hasPrev={lightboxIdx! > 0}
          hasNext={lightboxIdx! < filtered.length - 1}
          onPrev={() => setLightboxIdx((i) => (i === null ? i : Math.max(0, i - 1)))}
          onNext={() =>
            setLightboxIdx((i) => (i === null ? i : Math.min(filtered.length - 1, i + 1)))
          }
          onClose={() => setLightboxIdx(null)}
          onTrashed={handleTrashed}
          onRenamed={handleRenamed}
        />
      )}

      {uploads.dragging && (
        <div className="g-dropveil">
          <div className="g-dropveil-inner">
            <div className="g-dropveil-icon">↑</div>
            <p className="g-dropveil-title">{t("photos.dropTitle")}</p>
            <p className="g-dropveil-sub">{t("photos.dropSub")}</p>
          </div>
        </div>
      )}

      {uploadOpen && (
        <Upload
          status={uploads.status}
          running={uploads.running}
          start={uploads.start}
          cancel={uploads.cancel}
          clear={uploads.clear}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </div>
  );
}
