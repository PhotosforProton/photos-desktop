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
import { downloadMessage, downloadPhotos, type SaveProgress } from "../lib/download";
import { pinOffline, unpinOffline, watchOffline } from "../lib/offline";
import { DownloadProgress } from "../components/DownloadProgress";
import { Avatar } from "../components/Avatar";
import { ProfileMenu, type Account } from "../components/ProfileMenu";
import { Settings, DEFAULT_SETTINGS, type AppSettings } from "./Settings";
import { applyTheme } from "../lib/theme";
import { Albums, type Album } from "./Albums";
import { Shared, type SharedItem, type Tab } from "./Shared";
import { Trash } from "./Trash";
import {
  CallMadeIcon,
  CallReceivedIcon,
  ChevronLeftIcon,
  CloseIcon,
  DownloadIcon,
  UploadArrowIcon,
  FilterIcon,
  HeartIcon,
  LibraryAddIcon,
  OfflinePinIcon,
  PencilIcon,
  SearchIcon,
  ShareIcon,
  SwapHorizIcon,
  TrashIcon,
} from "../components/icons";
import { Upload } from "../components/Upload";
import { Lightbox } from "../components/Lightbox";
import { Confirm } from "../components/Confirm";
import { ContextMenu, type MenuAction, type MenuAt } from "../components/ContextMenu";
import { AlbumPicker, AlbumPhotoLossDialog, NameDialog } from "../components/AlbumDialogs";
import { ShareDialog } from "../components/ShareDialog";
import { FilterPanel, type MediaType } from "../components/FilterPanel";
import { PhotoGrid, PhotoGridSkeleton } from "../components/PhotoGrid";
import { cachedThumbnail } from "../lib/thumbStore";
import { DebugHud } from "../components/DebugHud";
import { Marquee, SelectionBar, useSelection } from "../hooks/useSelection";
import { useWarmViews } from "../hooks/useWarmViews";
import { CATEGORIES, isVideo, TAG, withFavorite } from "../lib/tags";
import { cachedMediaType } from "../lib/mediaTypes";
import { useUploads } from "../hooks/useUploads";
import { useT } from "../lib/i18n";
import { dropPreview, prefetchAfter } from "../lib/previewStore";
import "../styles/Photos.css";

/** How many neighbours on each side of the open photo to warm in advance. */
const PREFETCH_RADIUS = 2;

type TimelineItem = { uid: string; captureTime: number; tags: number[] };
type NodeMeta = { name: string; mediaType: string | null };
type View = "photos" | "albums" | "shared" | "trash";

/**
 * What to tell the viewer a photo is, and only when it is actually known.
 *
 * `undefined` is the honest answer for a photo nothing has resolved yet, and it matters:
 * the viewer reads the media type out of the details it fetches anyway, but only for a
 * caller that did not already claim to know. A confident "image" on a video is worse
 * than saying nothing, because it silences that fallback.
 */
function videoKind(item: TimelineItem): "video" | "image" | undefined {
  const known = isVideo(item.tags, cachedMediaType(item.uid));
  if (known === undefined) return undefined;
  return known ? "video" : "image";
}

/** Quick media-type filters for the search bar. Matched against `mediaType`. */
const TYPES = [
  { key: "image", labelKey: "filter.images" },
  { key: "video", labelKey: "filter.videos" },
];

// Desktop is wide, so use a size-based grid: cells stay small, many per row.
// Zoom changes the minimum cell width (in px). The chosen step is persisted in
// the settings, so the default only applies before a first choice is made.
const CELL_SIZES = [92, 116, 148, 190, 248];

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
  // A shared album looked into, lifted for the same reason as the one above: the
  // header its back button lives in belongs to this row.
  const [sharedAlbumOpen, setSharedAlbumOpen] = useState<SharedItem | null>(null);
  // Lifted so the trash's count and its empty button can share the top bar row.
  const [trashCount, setTrashCount] = useState<number | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const [confirmTrash, setConfirmTrash] = useState(false);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saveProgress, setSaveProgress] = useState<SaveProgress | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Escape belongs to the lightbox while it is open.
  const sel = useSelection(scrollRef, lightboxIdx === null);
  const { selected } = sel;
  // Whether one of the selection's actions is still working, so the bar can stand
  // down instead of taking a second click on work already in flight. The ref is what
  // actually bars it: the right-click menu offers the same actions and does not wait
  // for a render to know.
  const [selectionBusy, setSelectionBusy] = useState(false);
  const selectionRunning = useRef(false);

  /** Runs one selection action, holding the bar down for as long as it takes. */
  const runSelection = useCallback(async (action: () => Promise<void>) => {
    if (selectionRunning.current) return;
    selectionRunning.current = true;
    setSelectionBusy(true);
    try {
      await action();
    } finally {
      selectionRunning.current = false;
      setSelectionBusy(false);
    }
  }, []);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [meta, setMeta] = useState<Record<string, NodeMeta>>({});
  const [indexing, setIndexing] = useState(false);
  /** How far the search index has got, so a run cut short can pick up where it was. */
  const indexedUpTo = useRef(0);

  // Once the timeline has loaded (the sidecar is signed in), fill the Explorer
  // "Proton Photos" folder with cloud-photo placeholders. Once per session.
  const mountPopulated = useRef(false);
  useEffect(() => {
    if (!mountPopulated.current && items.length > 0) {
      mountPopulated.current = true;
      void invoke("populate_mount").catch(() => {});
    }
  }, [items.length]);

  // Which photos are downloaded (hydrated placeholders) so the grid can badge them.
  // Polled, because Explorer can hydrate/free them independently of the app.
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

  // Which photos the app keeps its own encrypted copy of. A different set from
  // `localUids` above, and a different place: these never reach the Explorer folder.
  // The sidecar owns the state, so this only watches it.
  const [offlineUids, setOfflineUids] = useState<Set<string>>(new Set());
  useEffect(() => watchOffline((s) => setOfflineUids(new Set(s.pinned))), []);

  // The single sidecar serves one request at a time, so the background warmer must
  // yield to more urgent work. It pauses while a photo is open (its full-res load) or
  // while the Explorer mount is populating/hydrating (a "mount-busy" signal from Rust),
  // so those own the channel and never wait behind a warm batch.
  const lightboxOpenRef = useRef(false);
  useEffect(() => {
    lightboxOpenRef.current = lightboxIdx !== null;
  }, [lightboxIdx]);

  // The host's sync state, read the way the tray popup reads it: seeded from
  // `sync_busy` because the mount may already be working when the window opens,
  // then following the transitions. It is state rather than a ref alone so the
  // avatar can show it; the warmer keeps reading the ref below, so a transition
  // does not restart its loop.
  const [mountBusy, setMountBusy] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void invoke<boolean>("sync_busy")
      .then((b) => {
        if (!cancelled) setMountBusy(b);
      })
      .catch(() => {
        /* leave it idle if the host cannot say */
      });
    const un = listen<boolean>("mount-busy", (e) => setMountBusy(!!e.payload));
    return () => {
      cancelled = true;
      void un.then((f) => f());
    };
  }, []);

  const mountBusyRef = useRef(false);
  useEffect(() => {
    mountBusyRef.current = mountBusy;
  }, [mountBusy]);

  // Every thumbnail the warmer decrypts is for the timeline's own grid, so it has
  // no business holding the one channel while the user is looking at something
  // else. This is what made the other views sit there loading: each fetches once on
  // arrival, and that one fetch queued behind a decrypt batch and its pause.
  const offTimelineRef = useRef(false);
  useEffect(() => {
    offTimelineRef.current = view !== "photos";
  }, [view]);

  // Warm the whole thumbnail cache in the background so scrolling to any month is
  // instant instead of decrypting on demand. Gentle: small batches with a pause
  // between, and it stands aside whenever something more urgent needs the sidecar.
  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    const uids = items.map((it) => it.uid);
    (async () => {
      // Kept small so one uninterruptible warm request is only ever a few
      // thumbnails: an interactive call waits at most one short batch, not twelve.
      const BATCH = 4;
      for (let i = 0; i < uids.length && !cancelled; i += BATCH) {
        // Stand aside while a photo is open, the mount is hydrating, or another
        // view is on screen and wants the channel for its own data.
        while (
          !cancelled &&
          (lightboxOpenRef.current || mountBusyRef.current || offTimelineRef.current)
        ) {
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

  // The open album's header actions, and the live count Albums reports up.
  const [albumCount, setAlbumCount] = useState<number | null>(null);
  const [albumRenaming, setAlbumRenaming] = useState(false);
  const [albumSharing, setAlbumSharing] = useState(false);
  const [albumConfirmDelete, setAlbumConfirmDelete] = useState(false);
  const [albumStranded, setAlbumStranded] = useState<number | null>(null);
  const [albumBusy, setAlbumBusy] = useState(false);
  const [pickAlbum, setPickAlbum] = useState(false);
  // Which album rename and delete act on: the open one when the header asks, the
  // right-clicked one when the list does. One pair of handlers serves both.
  const [albumTarget, setAlbumTarget] = useState<Album | null>(null);

  // The right-click menus. Each holds where the click landed and what it landed on.
  const [albumMenu, setAlbumMenu] = useState<MenuAt<Album> | null>(null);
  const [photoMenu, setPhotoMenu] = useState<MenuAt<string> | null>(null);
  const [renamingPhoto, setRenamingPhoto] = useState<{ uid: string; name: string } | null>(null);
  const [renameBusy, setRenameBusy] = useState(false);
  const [sharingPhoto, setSharingPhoto] = useState<{ uid: string; name: string } | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Reload everything the account owns: after an upload, and after a restore puts
  // a photo back in the timeline. Stable identity, so the upload poller is not
  // restarted on every render.
  const bumpReload = useCallback(() => setReloadKey((k) => k + 1), []);
  const uploads = useUploads(bumpReload);

  // Albums, Shared and the trash are mounted only while they are on screen, so
  // each arrival used to start from nothing. Read them once the timeline has
  // settled, and only while the timeline is what is on screen.
  const warm = useWarmViews(!loading && items.length > 0, view === "photos", reloadKey);

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

  // A drop is accepted anywhere in the window, and the panel it belongs to is usually
  // closed when one lands, so a refused upload says so here instead of nowhere.
  useEffect(() => {
    if (uploads.error) setToast(uploads.error);
  }, [uploads.error]);

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

  // The grid zoom is a persisted preference rather than view state, so the grid
  // reopens at the size the user left it at. Reading and writing both go through
  // `settings`, so there is a single source of truth and it cannot drift.
  const zoom = settings.zoom;
  const setZoom = (next: number) =>
    updateSettings({ ...settings, zoom: Math.min(CELL_SIZES.length - 1, Math.max(0, next)) });

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
    setError("");
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

  // A reload re-reads the whole timeline, so a position in the old list says nothing
  // about the new one: index it again from the top, which is also how anything
  // uploaded since gets in.
  useEffect(() => {
    indexedUpTo.current = 0;
  }, [reloadKey]);

  // The SDK has no server-side search, so we build a local index of names and
  // media types. It streams in batches, on first use, and results appear as it
  // fills rather than blocking the grid. Closing the search bar interrupts it and
  // reopening carries on from there: the index used to stop for good wherever it was
  // when the bar closed, and then answer "no matches" for everything past that point.
  useEffect(() => {
    if (!searchOpen || indexedUpTo.current >= items.length) return;
    let cancelled = false;
    setIndexing(true);

    (async () => {
      const BATCH = 150; // the SDK batches node lookups server side
      for (let i = indexedUpTo.current; i < items.length && !cancelled; i += BATCH) {
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
        indexedUpTo.current = Math.min(i + BATCH, items.length);
      }
      if (!cancelled) setIndexing(false);
    })();

    return () => {
      cancelled = true;
      // Here rather than past the guard above: an interrupted run never reaches that
      // line, which is what left "Indexing…" on screen for the rest of the session.
      setIndexing(false);
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

    // The Videos tag is taken as proof when it is there and as nothing when it is not,
    // so an untagged video is not filed under photos for good. What settles those is the
    // media type: from the search index where it has reached, and otherwise from
    // whatever the grid has already resolved for the cells scrolled past.
    if (mediaType !== "all") {
      const wantVideo = mediaType === "video";
      base = base.filter(
        (it) =>
          (isVideo(it.tags, meta[it.uid]?.mediaType ?? cachedMediaType(it.uid)) ?? false) ===
          wantVideo,
      );
    }

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

  // What the viewer's filmstrip and contents list walk: the same order the grid
  // shows, so stepping through the viewer and scrolling the grid agree. Memoised
  // because the viewer takes the array's identity as "the list changed", and a
  // fresh one built on every render would restart its thumbnail loading.
  const viewerItems = useMemo(
    () => filtered.map((it) => ({ uid: it.uid, name: meta[it.uid]?.name, video: videoKind(it) === "video" })),
    [filtered, meta],
  );

  // Un-favouriting under the Favorites filter drops the open photo out of the
  // grid. A stale index then renders no lightbox while still holding the grid's
  // keys and marquee disabled, so pull it back in range (or close).
  useEffect(() => {
    setLightboxIdx((i) =>
      i === null || i < filtered.length ? i : filtered.length > 0 ? filtered.length - 1 : null,
    );
  }, [filtered.length]);

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

  /** The timeline's tags are what the Favorites filter and the grid badge read. */
  function handleFavoriteChanged(uid: string, favorite: boolean) {
    setItems((prev) =>
      prev.map((it) => (it.uid === uid ? { ...it, tags: withFavorite(it.tags, favorite) } : it)),
    );
  }

  /**
   * Favourites the selection, for the right-click menu. The hearts flip now and
   * the ones the server refuses flip back, so the grid never keeps a heart Proton
   * does not have.
   */
  async function favoriteSelected(favorite: boolean) {
    const uids = [...selected];
    if (uids.length === 0) return;
    uids.forEach((u) => handleFavoriteChanged(u, favorite));
    try {
      const results = await rpc<{ uid: string; ok: boolean }[]>("setFavorite", { uids, favorite });
      const failed = results.filter((r) => !r.ok);
      failed.forEach((r) => handleFavoriteChanged(r.uid, !favorite));
      if (failed.length > 0) setToast(t("viewer.favoriteFailed"));
    } catch (e) {
      uids.forEach((u) => handleFavoriteChanged(u, !favorite));
      setToast(String(e));
    }
  }

  /**
   * One photo's name, which the dialogs below need and the grid does not have:
   * the timeline carries uids and tags only, and the search index is the one
   * thing that ever asks for names, so on an unsearched library it has to be
   * fetched. Null means there is no name to show, and any failure has already
   * been reported by the time it returns.
   */
  async function photoName(uid: string): Promise<string | null> {
    const known = meta[uid]?.name;
    if (known !== undefined) return known;
    try {
      const [m] = await rpc<{ uid: string; name: string; mediaType: string | null }[]>(
        "getMetadata",
        { uids: [uid] },
      );
      if (!m) return null;
      setMeta((prev) => ({ ...prev, [m.uid]: { name: m.name, mediaType: m.mediaType } }));
      return m.name;
    } catch (e) {
      setToast(String(e));
      return null;
    }
  }

  /** Opens the rename box, which is why the name is fetched: it never opens empty. */
  async function openRenamePhoto(uid: string) {
    const name = await photoName(uid);
    if (name !== null) setRenamingPhoto({ uid, name });
  }

  /**
   * Opens the share dialog. The name is only the subtitle there, so a photo
   * whose name could not be read is still shareable rather than unreachable.
   */
  async function openSharePhoto(uid: string) {
    setSharingPhoto({ uid, name: (await photoName(uid)) ?? "" });
  }

  async function renamePhoto(name: string) {
    const target = renamingPhoto;
    if (!target) return;
    setRenameBusy(true);
    try {
      const res = await rpc<{ uid: string; name: string }>("renamePhoto", {
        uid: target.uid,
        name,
      });
      handleRenamed(res.uid, res.name);
    } catch (e) {
      setToast(String(e));
    } finally {
      setRenameBusy(false);
      setRenamingPhoto(null);
    }
  }

  /**
   * A right-click acts on what is highlighted, so a photo outside the selection
   * becomes the selection first — the way a file manager does it. Right-clicking
   * inside a selection leaves it alone, so a menu can act on all of it.
   */
  function onCellContext(uid: string, e: { clientX: number; clientY: number }) {
    if (!selected.has(uid)) sel.setSelected(new Set([uid]));
    setPhotoMenu({ x: e.clientX, y: e.clientY, target: uid });
  }

  // The SDK offers no prefetch, so we warm the neighbours ourselves. The sidecar
  // serves repeats from its encrypted on-disk cache, so this is cheap. It waits for
  // the open photo's own preview to resolve first, so the warm never competes with
  // the one the user is actually waiting for on the single channel.
  useEffect(() => {
    if (lightboxIdx === null) return;
    const current = filtered[lightboxIdx];
    if (!current) return;
    const uids: string[] = [];
    for (let d = 1; d <= PREFETCH_RADIUS; d++) {
      const next = filtered[lightboxIdx + d];
      const prev = filtered[lightboxIdx - d];
      if (next) uids.push(next.uid);
      if (prev) uids.push(prev.uid);
    }
    return prefetchAfter(current.uid, uids);
  }, [lightboxIdx, filtered]);

  /**
   * Moves the selection to the trash. Only what actually went leaves the grid,
   * and the count says so: a photo the server kept is still there, and saying
   * nothing about it would leave the grid disagreeing with the trash.
   */
  async function trashSelected() {
    const uids = [...selected];
    if (uids.length === 0) return;
    setError("");
    try {
      const results = await rpc<{ uid: string; ok: boolean }[]>("trashPhotos", { uids });
      const gone = new Set(results.filter((r) => r.ok).map((r) => r.uid));
      gone.forEach(dropPreview);
      setItems((prev) => prev.filter((it) => !gone.has(it.uid)));
      sel.clear();
      const failed = results.length - gone.size;
      setToast(
        failed > 0
          ? t("trash.movedPartial", { ok: gone.size, failed })
          : t("trash.moved", { count: gone.size }),
      );
    } catch (e) {
      setError(String(e));
    }
  }

  /** Destroys the whole trash. The view below refetches once it is done. */
  async function emptyTrash() {
    try {
      await rpc("emptyTrash");
      setToast(t("trash.emptied"));
      bumpReload();
    } catch (e) {
      setToast(String(e));
    }
  }

  /**
   * Puts the selected photos in an album. The whole selection goes down in one
   * call: the SDK batches it to the server's ten-link cap itself, counting the
   * related parts a photo brings with it.
   */
  async function addSelectedToAlbum(albumUid: string) {
    const uids = [...selected];
    if (uids.length === 0) return;
    setAlbumBusy(true);
    try {
      const results = await rpc<{ uid: string; ok: boolean }[]>("addPhotosToAlbum", {
        albumUid,
        uids,
      });
      const added = results.filter((r) => r.ok).length;
      const failed = results.length - added;
      setToast(
        failed > 0
          ? t("albums.addPartial", { ok: added, failed })
          : t("albums.added", { count: added }),
      );
      setPickAlbum(false);
      sel.clear();
      // The album now owns them, which the timeline hides if asked to.
      if (added > 0) bumpReload();
    } catch (e) {
      setToast(String(e));
      setPickAlbum(false);
    } finally {
      setAlbumBusy(false);
    }
  }

  async function renameAlbum(name: string) {
    const target = albumTarget;
    if (!target) return;
    setAlbumBusy(true);
    try {
      const res = await rpc<{ uid: string; name: string }>("renameAlbum", {
        uid: target.uid,
        name,
      });
      // The header follows only when the album it is showing is the one renamed;
      // renaming another from the list must not disturb it.
      setAlbumOpen((o) => (o?.uid === target.uid ? { ...o, name: res.name } : o));
      setAlbumRenaming(false);
      bumpReload();
    } catch (e) {
      setToast(String(e));
      setAlbumRenaming(false);
    } finally {
      setAlbumBusy(false);
    }
  }

  /**
   * Deletes the album the header or the list picked out. Asked plainly first,
   * with neither option: the server refuses if photos live only in there, and
   * that refusal is the one chance to ask before they are gone. Answering it is
   * `AlbumPhotoLossDialog`'s job.
   */
  async function deleteAlbum(options: { force?: boolean; saveToTimeline?: boolean } = {}) {
    const target = albumTarget;
    if (!target) return;
    setAlbumBusy(true);
    try {
      const res = await rpc<{ status: string; count?: number }>("deleteAlbum", {
        uid: target.uid,
        ...options,
      });
      if (res.status === "photosNotInTimeline") {
        setAlbumStranded(res.count ?? 0);
        return;
      }
      setAlbumStranded(null);
      // Closing the album only makes sense when it is the one that just went.
      setAlbumOpen((o) => (o?.uid === target.uid ? null : o));
      setToast(t("albums.deleted"));
      bumpReload();
    } catch (e) {
      setAlbumStranded(null);
      setToast(String(e));
    } finally {
      setAlbumBusy(false);
    }
  }

  // "Download" = fill the selected photos into the Proton Photos folder with the
  // Explorer mount on (their placeholders hydrate in place, ending as a green check),
  // or save the originals into a folder the user picks with it off. `downloadPhotos`
  // picks the mode.
  async function downloadSelected() {
    const all = [...selected];
    if (all.length === 0) return;
    // Skip photos already downloaded; re-selecting one of those is a no-op. Nothing is
    // downloaded with the mount off, so there the whole selection goes.
    const uids = all.filter((u) => !localUids.has(u));
    if (uids.length === 0) {
      setToast(t("download.alreadyDownloaded"));
      sel.clear();
      return;
    }
    try {
      const result = await downloadPhotos(uids, {
        onStart: () => setDownloading(true),
        onProgress: setSaveProgress,
      });
      if (result.mode === "cancelled") return;
      sel.clear();
      const message = downloadMessage(result);
      if (message) setToast(t(message.key, message.vars));
    } catch (e) {
      setToast(String(e));
    } finally {
      setDownloading(false);
      setSaveProgress(null);
    }
  }

  // Remove the local copy of the selected photos (dehydrate back to cloud-only).
  // Reports the photos the host actually freed, not the ones asked for.
  async function freeUpSelected() {
    const uids = [...selected].filter((u) => localUids.has(u));
    if (uids.length === 0) {
      setToast(t("download.notDownloaded"));
      sel.clear();
      return;
    }
    try {
      const freed = await invoke<number>("free_up_selected", { uids });
      sel.clear();
      setToast(freed === 0 ? t("download.freedUpNone") : t("download.freedUp", { count: freed }));
    } catch (e) {
      setToast(String(e));
    }
  }

  // Keep the selection inside the app, encrypted, so it opens with no connection.
  // Nothing is written to the Proton Photos folder: that is Download's job, above.
  async function offlineAddSelected() {
    const uids = [...selected].filter((u) => !offlineUids.has(u));
    if (uids.length === 0) {
      setToast(t("offline.alreadyOffline"));
      sel.clear();
      return;
    }
    try {
      const added = await pinOffline(uids);
      sel.clear();
      setToast(t(added === 1 ? "offline.added.one" : "offline.added.other", { count: added }));
    } catch (e) {
      setToast(String(e));
    }
  }

  /** Drop the app's own copies and reclaim the space they held. */
  async function offlineRemoveSelected() {
    const uids = [...selected].filter((u) => offlineUids.has(u));
    if (uids.length === 0) {
      setToast(t("offline.noneOffline"));
      sel.clear();
      return;
    }
    try {
      const removed = await unpinOffline(uids);
      sel.clear();
      setToast(t(removed === 1 ? "offline.removed.one" : "offline.removed.other", { count: removed }));
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
    setZoom(e.deltaY > 0 ? zoom - 1 : zoom + 1);
  }

  const cellSize = CELL_SIZES[zoom];

  const current = lightboxIdx !== null ? filtered[lightboxIdx] : null;

  // Rename and delete are the album header's own actions, pointed at whichever
  // album the click picked out rather than at a second copy of them.
  const albumActions: MenuAction[] = albumMenu
    ? [
        {
          key: "rename",
          label: t("albums.rename"),
          icon: <PencilIcon size={14} />,
          onSelect: () => {
            setAlbumTarget(albumMenu.target);
            setAlbumRenaming(true);
          },
        },
        {
          key: "delete",
          label: t("albums.delete"),
          icon: <TrashIcon size={14} />,
          danger: true,
          onSelect: () => {
            setAlbumTarget(albumMenu.target);
            setAlbumConfirmDelete(true);
          },
        },
      ]
    : [];

  // The right-clicked photo settles what the heart says; the action then applies
  // to everything highlighted, which is that photo unless a selection was already
  // standing. Renaming is the one thing a selection cannot share, so it is offered
  // only when there is exactly one photo to name. Trashing sits last, past the
  // things that can be taken back, as it does in the selection bar.
  const photoFavorite = !!photoMenu &&
    !!items.find((it) => it.uid === photoMenu.target)?.tags?.includes(TAG.Favorite);
  // Same rule for the offline copy: the photo under the cursor decides which way the
  // one entry points, so the menu never offers both at once.
  const photoOffline = !!photoMenu && offlineUids.has(photoMenu.target);
  // The selection bar follows the same rule, over the whole selection: taking the
  // copies back is only offered once there is nothing left in it to keep. Offering
  // both at once read as a contradiction, and cost the row a button it needed.
  const allSelectedOffline = useMemo(
    () => selected.size > 0 && [...selected].every((u) => offlineUids.has(u)),
    [selected, offlineUids],
  );
  const photoActions: MenuAction[] = photoMenu
    ? [
        {
          key: "album",
          label: t("selection.addToAlbum"),
          icon: <LibraryAddIcon size={14} />,
          onSelect: () => setPickAlbum(true),
        },
        {
          key: "favorite",
          label: photoFavorite ? t("selection.unfavorite") : t("selection.favorite"),
          icon: <HeartIcon size={14} filled={photoFavorite} />,
          onSelect: () => void favoriteSelected(!photoFavorite),
        },
        // Renaming and sharing both name one node, so neither is offered while
        // a selection stands: there would be no saying which one they meant.
        ...(selected.size === 1
          ? [
              {
                key: "rename",
                label: t("selection.rename"),
                icon: <PencilIcon size={14} />,
                onSelect: () => void openRenamePhoto(photoMenu.target),
              },
              {
                key: "share",
                label: t("selection.share"),
                icon: <ShareIcon size={14} />,
                onSelect: () => void openSharePhoto(photoMenu.target),
              },
            ]
          : []),
        {
          key: "offline",
          label: photoOffline ? t("selection.offlineRemove") : t("selection.offlineAdd"),
          icon: <OfflinePinIcon size={14} />,
          onSelect: () =>
            void runSelection(photoOffline ? offlineRemoveSelected : offlineAddSelected),
        },
        {
          key: "download",
          label: t("selection.download"),
          icon: <DownloadIcon size={14} />,
          onSelect: () => void runSelection(downloadSelected),
        },
        {
          key: "trash",
          label: t("selection.trash"),
          icon: <TrashIcon size={14} />,
          danger: true,
          onSelect: () => setConfirmTrash(true),
        },
      ]
    : [];

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
              <SearchIcon />
            </button>
            <div className="g-spacer" />
          </>
        )}
        {view === "albums" && albumOpen && (
          <>
            <button className="g-back" onClick={() => setAlbumOpen(null)} title={t("albums.backToAlbums")}>
              <ChevronLeftIcon />
              {t("nav.albums")}
            </button>
            {/* The name is the rename control, and the pencil is what says so,
                so neither needs a button of its own spelling it out. */}
            <button
              className="g-albumname"
              disabled={albumBusy}
              onClick={() => {
                setAlbumTarget(albumOpen);
                setAlbumRenaming(true);
              }}
              title={t("albums.renameTitle")}
            >
              <span className="g-crumbtitle">{albumOpen.name || t("albums.untitled")}</span>
              <PencilIcon size={14} />
            </button>
            <span className="g-monthcount">
              {t(
                (albumCount ?? albumOpen.photoCount) === 1
                  ? "common.photoCount.one"
                  : "common.photoCount.other",
                { count: albumCount ?? albumOpen.photoCount },
              )}
            </span>
            <div className="g-spacer" />
            <button
              className="g-iconbtn"
              disabled={albumBusy}
              onClick={() => setAlbumSharing(true)}
              title={t("albums.share")}
            >
              <ShareIcon size={16} />
            </button>
            <button
              className="g-iconbtn g-albumdel"
              disabled={albumBusy}
              onClick={() => {
                setAlbumTarget(albumOpen);
                setAlbumConfirmDelete(true);
              }}
              title={t("albums.delete")}
            >
              <TrashIcon size={16} />
            </button>
          </>
        )}
        {view === "shared" && !sharedAlbumOpen && (
          <>
            {/* Android's control for the same choice: one pill that turns round,
                not two that compete. The arrow says which way the sharing goes and
                the swap mark says a click flips it. */}
            <button
              className="g-filterpill g-sharedpill"
              onClick={() => setSharedTab(sharedTab === "with" ? "by" : "with")}
              title={t("shared.flip")}
            >
              <span className="g-shareway">
                {sharedTab === "with" ? <CallReceivedIcon /> : <CallMadeIcon />}
              </span>
              <span>{t(sharedTab === "with" ? "shared.withMe" : "shared.byMe")}</span>
              <span className="g-shareswap">
                <SwapHorizIcon />
              </span>
            </button>
            {sharedCount != null && <span className="g-monthcount">{sharedCount}</span>}
          </>
        )}
        {/* The open shared album takes the row the tab pill was using. The name does
            not rename here: an album reached through sharing may not be the reader's
            to rename, and the one that is has its own screen where it can be. */}
        {view === "shared" && sharedAlbumOpen && (
          <>
            <button
              className="g-back"
              onClick={() => setSharedAlbumOpen(null)}
              title={t("shared.back")}
            >
              <ChevronLeftIcon />
              {t("nav.shared")}
            </button>
            <span className="g-crumbtitle g-crumbplain">
              {sharedAlbumOpen.name || t("albums.untitled")}
            </span>
            {sharedCount != null && (
              <span className="g-monthcount">
                {t(
                  sharedCount === 1 ? "common.photoCount.one" : "common.photoCount.other",
                  { count: sharedCount },
                )}
              </span>
            )}
          </>
        )}
        {view === "trash" && (
          <>
            <span className="g-headpill">{t("nav.trash")}</span>
            {/* A count of nothing is not worth a pill, and neither is emptying an
                empty trash, so both wait until there is something in there. */}
            {!!trashCount && <span className="g-headpill count">{trashCount}</span>}
            {!!trashCount && (
              <button className="g-chip danger" onClick={() => setConfirmEmpty(true)}>
                {t("trash.emptyAction")}
              </button>
            )}
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
          // The timeline's own first read, and whatever the host is syncing
          // behind it: the same signal the tray's status line shows. An upload
          // outranks both, and says so in its own colour.
          syncing={(loading || mountBusy) && !uploads.running}
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
            <CloseIcon />
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
            offlineUids={offlineUids}
            reloadKey={reloadKey}
            initial={warm.albums}
            onCount={setAlbumCount}
            onChanged={bumpReload}
            onAlbumContext={(album, e) =>
              setAlbumMenu({ x: e.clientX, y: e.clientY, target: album })
            }
            onData={warm.putAlbums}
          />
        ) : view === "shared" ? (
          <Shared
            cellSize={cellSize}
            tab={sharedTab}
            open={sharedAlbumOpen}
            onOpenChange={setSharedAlbumOpen}
            // Only the tab the warm read covers; the other one reads itself.
            initial={sharedTab === "by" ? warm.shared : null}
            onCount={setSharedCount}
            onData={(rows) => sharedTab === "by" && warm.putShared(rows)}
          />
        ) : view === "trash" ? (
          <Trash
            cellSize={cellSize}
            reloadKey={reloadKey}
            initial={warm.trash}
            onCount={setTrashCount}
            onRestored={bumpReload}
            onData={warm.putTrash}
          />
        ) : (
          <>
            {error && <div className="g-error">{error}</div>}

            {loading && items.length === 0 && <PhotoGridSkeleton count={30} cellSize={cellSize} />}

            {!loading && filtered.length === 0 && !error && (
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
                  onContext={onCellContext}
                  offlineUids={offlineUids}
                  localUids={localUids}
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
        <button className={`g-tab ${view === "trash" ? "sel" : ""}`} onClick={() => setView("trash")}>
          {t("nav.trash")}
        </button>
      </div>

      {settings.debug && <DebugHud itemCount={items.length} />}

      {loading && items.length > 0 && view === "photos" && (
        <div className="g-loadhint">{t("photos.loadingThumbnails")}</div>
      )}

      {/* The timeline's own selection, so it cannot linger over a view that runs
          its own (the trash offers restore for the same keys). */}
      {view === "photos" && (
        <>
          <Marquee rect={sel.marquee} />
          <SelectionBar
            count={selected.size}
            busy={selectionBusy}
            onCancel={sel.clear}
            onAddToAlbum={() => setPickAlbum(true)}
            onDownload={() => void runSelection(downloadSelected)}
            onFreeUp={() => void runSelection(freeUpSelected)}
            onOfflineAdd={
              allSelectedOffline ? undefined : () => void runSelection(offlineAddSelected)
            }
            onOfflineRemove={
              allSelectedOffline ? () => void runSelection(offlineRemoveSelected) : undefined
            }
            onTrash={() => setConfirmTrash(true)}
          />
        </>
      )}

      {albumMenu && (
        <ContextMenu
          x={albumMenu.x}
          y={albumMenu.y}
          actions={albumActions}
          onClose={() => setAlbumMenu(null)}
        />
      )}

      {photoMenu && (
        <ContextMenu
          x={photoMenu.x}
          y={photoMenu.y}
          actions={photoActions}
          onClose={() => setPhotoMenu(null)}
        />
      )}

      {renamingPhoto && (
        <NameDialog
          title={t("photos.renameTitle")}
          confirmLabel={t("selection.rename")}
          initial={renamingPhoto.name}
          placeholder={t("photos.namePlaceholder")}
          busy={renameBusy}
          onConfirm={(name) => void renamePhoto(name)}
          onCancel={() => setRenamingPhoto(null)}
        />
      )}

      {(downloading || toast) && (
        <div className="g-toast">
          {downloading ? (
            saveProgress && saveProgress.total > 0 ? (
              <DownloadProgress
                label={t("download.progress", {
                  done: saveProgress.done,
                  total: saveProgress.total,
                })}
                done={saveProgress.done}
                failed={saveProgress.failed}
                total={saveProgress.total}
              />
            ) : (
              t("download.running")
            )
          ) : (
            toast
          )}
        </div>
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
            void runSelection(trashSelected);
          }}
        />
      )}

      {confirmEmpty && (
        <Confirm
          title={t("confirm.emptyTitle")}
          message={t("confirm.emptyMessage")}
          confirmLabel={t("confirm.emptyConfirm")}
          danger
          irreversible
          onCancel={() => setConfirmEmpty(false)}
          onConfirm={() => {
            setConfirmEmpty(false);
            void emptyTrash();
          }}
        />
      )}

      {pickAlbum && (
        <AlbumPicker
          count={selected.size}
          busy={albumBusy}
          onPick={(albumUid) => void addSelectedToAlbum(albumUid)}
          onCancel={() => setPickAlbum(false)}
        />
      )}

      {albumRenaming && albumTarget && (
        <NameDialog
          title={t("albums.renameTitle")}
          confirmLabel={t("albums.rename")}
          initial={albumTarget.name}
          busy={albumBusy}
          onConfirm={(name) => void renameAlbum(name)}
          onCancel={() => setAlbumRenaming(false)}
        />
      )}

      {albumSharing && albumOpen && (
        <ShareDialog
          uid={albumOpen.uid}
          title={albumOpen.name || t("albums.untitled")}
          onClose={() => setAlbumSharing(false)}
        />
      )}

      {sharingPhoto && (
        <ShareDialog
          uid={sharingPhoto.uid}
          title={sharingPhoto.name}
          onClose={() => setSharingPhoto(null)}
        />
      )}

      {/* Deleting an album skips the trash, so the album itself never comes back
          even when every photo in it does. */}
      {albumConfirmDelete && albumTarget && (
        <Confirm
          title={t("confirm.deleteAlbumTitle")}
          message={t("confirm.deleteAlbumMessage")}
          confirmLabel={t("albums.delete")}
          danger
          irreversible
          onCancel={() => setAlbumConfirmDelete(false)}
          onConfirm={() => {
            setAlbumConfirmDelete(false);
            void deleteAlbum();
          }}
        />
      )}

      {albumStranded !== null && (
        <AlbumPhotoLossDialog
          count={albumStranded}
          busy={albumBusy}
          onSaveToTimeline={() => void deleteAlbum({ saveToTimeline: true })}
          onDeletePhotos={() => void deleteAlbum({ force: true })}
          onCancel={() => setAlbumStranded(null)}
        />
      )}

      {current && (
        <Lightbox
          uid={current.uid}
          isLocal={localUids.has(current.uid)}
          isOffline={offlineUids.has(current.uid)}
          // Only ever a definite answer, never a guess. A known video branches the
          // viewer straight to playback without waiting for the details; anything not
          // yet known is left undefined so the viewer falls back to the media type in
          // the details it fetches anyway. Passing "image" on a missing tag is what made
          // an untagged video unplayable: it looked definite, so the fallback that would
          // have caught it never ran.
          kind={videoKind(current)}
          fallbackUrl={cachedThumbnail(current.uid) ?? null}
          hasPrev={lightboxIdx! > 0}
          hasNext={lightboxIdx! < filtered.length - 1}
          onPrev={() => setLightboxIdx((i) => (i === null ? i : Math.max(0, i - 1)))}
          onNext={() =>
            setLightboxIdx((i) => (i === null ? i : Math.min(filtered.length - 1, i + 1)))
          }
          items={viewerItems}
          index={lightboxIdx!}
          onJump={setLightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onTrashed={handleTrashed}
          onRenamed={handleRenamed}
          isFavorite={!!current.tags?.includes(TAG.Favorite)}
          onFavoriteChanged={handleFavoriteChanged}
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
          error={uploads.error}
          start={uploads.start}
          cancel={uploads.cancel}
          clear={uploads.clear}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </div>
  );
}
