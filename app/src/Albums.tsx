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

import { useEffect, useMemo, useRef, useState } from "react";
import { rpc } from "./rpc";
import { useThumbnails } from "./useThumbnails";
import { PhotoGrid, PhotoGridSkeleton } from "./PhotoGrid";
import { Marquee, SelectionBar, useSelection } from "./useSelection";
import { Lightbox } from "./Lightbox";
import { Confirm } from "./Confirm";
import { useT } from "./i18n";
import { dropPreview, prefetchPreviews } from "./previewStore";

const PREFETCH_RADIUS = 2;

export type Album = {
  uid: string;
  name: string;
  photoCount: number;
  coverUid: string | null;
  lastActivityTime: number;
};
type AlbumPhoto = { uid: string; captureTime: number };

/**
 * Albums, served entirely by the SDK (`iterateAlbums` / `iterateAlbum`).
 * The open album is controlled from above so its header can live in the top bar.
 */
export function Albums({
  cellSize,
  open,
  onOpenChange,
}: {
  cellSize: number;
  open: Album | null;
  onOpenChange: (album: Album | null) => void;
}) {
  const t = useT();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [confirmTrash, setConfirmTrash] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const sel = useSelection(detailRef, lightboxIdx === null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await rpc<Album[]>("getAlbums");
        if (cancelled) return;
        setAlbums(list);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setLightboxIdx(null);
    sel.clear();
    if (!open) {
      setPhotos([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const list = await rpc<AlbumPhoto[]>("getAlbumPhotos", { uid: open.uid });
        if (cancelled) return;
        setPhotos(list);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const coverUids = useMemo(
    () => (open ? [] : albums.map((a) => a.coverUid).filter((u): u is string => !!u)),
    [albums, open],
  );
  const covers = useThumbnails(coverUids);

  const photoUids = useMemo(() => photos.map((p) => p.uid), [photos]);
  const photoThumbs = useThumbnails(photoUids);

  // Warm the lightbox neighbours, exactly as the timeline does.
  useEffect(() => {
    if (lightboxIdx === null) return;
    const uids: string[] = [];
    for (let d = 1; d <= PREFETCH_RADIUS; d++) {
      if (photos[lightboxIdx + d]) uids.push(photos[lightboxIdx + d].uid);
      if (photos[lightboxIdx - d]) uids.push(photos[lightboxIdx - d].uid);
    }
    prefetchPreviews(uids);
  }, [lightboxIdx, photos]);

  function onCellClick(uid: string) {
    if (sel.wasDragging()) return;
    if (sel.selected.size > 0) sel.toggle(uid);
    else setLightboxIdx(photos.findIndex((p) => p.uid === uid));
  }

  function removeLocally(uids: Set<string>) {
    uids.forEach(dropPreview);
    setPhotos((prev) => prev.filter((p) => !uids.has(p.uid)));
  }

  async function trashSelected() {
    const uids = [...sel.selected];
    if (uids.length === 0) return;
    try {
      const results = await rpc<{ uid: string; ok: boolean }[]>("trashPhotos", { uids });
      removeLocally(new Set(results.filter((r) => r.ok).map((r) => r.uid)));
      sel.clear();
    } catch (e) {
      setError(String(e));
    }
  }

  function handleTrashed(uid: string) {
    removeLocally(new Set([uid]));
    setLightboxIdx((i) => {
      if (i === null) return null;
      const remaining = photos.length - 1;
      return remaining <= 0 ? null : Math.min(i, remaining - 1);
    });
  }

  if (error) return <div className="g-error">{error}</div>;

  // ---- Album detail ----
  if (open) {
    const current = lightboxIdx !== null ? photos[lightboxIdx] : null;
    return (
      <div ref={detailRef} {...sel.containerProps}>
        {loading && photos.length === 0 && <PhotoGridSkeleton count={18} cellSize={cellSize} />}

        {!loading && photos.length === 0 && (
          <div className="g-empty">
            <p className="g-empty-title">{t("albums.empty")}</p>
          </div>
        )}

        <PhotoGrid
          items={photos}
          thumbs={photoThumbs}
          cellSize={cellSize}
          selected={sel.selected}
          onToggle={sel.toggle}
          onOpen={onCellClick}
          showBadges={false}
        />

        <Marquee rect={sel.marquee} />
        <SelectionBar
          count={sel.selected.size}
          onCancel={sel.clear}
          onTrash={() => setConfirmTrash(true)}
        />

        {confirmTrash && (
          <Confirm
            title={t("confirm.trashTitle")}
            message={t(
              sel.selected.size === 1 ? "confirm.trashCount.one" : "confirm.trashCount.other",
              { count: sel.selected.size },
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
            fallbackUrl={photoThumbs[current.uid] ?? null}
            hasPrev={lightboxIdx! > 0}
            hasNext={lightboxIdx! < photos.length - 1}
            onPrev={() => setLightboxIdx((i) => (i === null ? i : Math.max(0, i - 1)))}
            onNext={() =>
              setLightboxIdx((i) => (i === null ? i : Math.min(photos.length - 1, i + 1)))
            }
            onClose={() => setLightboxIdx(null)}
            onTrashed={handleTrashed}
            onRenamed={() => {}}
          />
        )}
      </div>
    );
  }

  // ---- Album list ----
  if (loading && albums.length === 0) {
    return (
      <div className="g-albums">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="g-album g-skel" key={i} />
        ))}
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="g-empty">
        <p className="g-empty-title">{t("albums.none")}</p>
        <p className="g-empty-sub">{t("albums.noneSub")}</p>
      </div>
    );
  }

  return (
    <div className="g-albums">
      {albums.map((a) => (
        <button className="g-album" key={a.uid} onClick={() => onOpenChange(a)}>
          <div className="g-album-cover">
            {a.coverUid && covers[a.coverUid] ? (
              <img src={covers[a.coverUid]!} alt="" draggable={false} />
            ) : (
              <div className="g-cell-ph" />
            )}
          </div>
          <div className="g-album-name">{a.name || t("albums.untitled")}</div>
          <div className="g-album-count">
            {t(a.photoCount === 1 ? "common.photoCount.one" : "common.photoCount.other", {
              count: a.photoCount,
            })}
          </div>
        </button>
      ))}
    </div>
  );
}
