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

import { useEffect, useMemo, useState } from "react";
import { rpc } from "../lib/rpc";
import { useThumbnails } from "../hooks/useThumbnails";
import { PhotoGrid, PhotoGridSkeleton } from "../components/PhotoGrid";
import { Lightbox } from "../components/Lightbox";
import { useT } from "../lib/i18n";
import { prefetchPreviews } from "../lib/previewStore";

type SharedItem = {
  uid: string;
  name: string;
  type: string;
  mediaType: string | null;
  isShared: boolean;
  isSharedPublicly: boolean;
  captureTime: number | null;
};

export type Tab = "by" | "with";

/**
 * Sharing, served entirely by the SDK (`iterateSharedNodes` / `...WithMe`).
 * The by-me / with-me toggle lives in the top bar (like the other views), so the
 * active tab is controlled from above and the count is reported back up for it.
 */
export function Shared({
  cellSize,
  tab,
  onCount,
}: {
  cellSize: number;
  tab: Tab;
  onCount?: (n: number | null) => void;
}) {
  const t = useT();
  const [items, setItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setItems([]);
    setLightboxIdx(null);
    (async () => {
      try {
        const list = await rpc<SharedItem[]>("getShared", { withMe: tab === "with" });
        if (cancelled) return;
        setItems(list);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  // Report the count up to the top bar (null while loading), so the header can show
  // it next to the tab toggle it now owns.
  useEffect(() => {
    onCount?.(loading ? null : items.length);
  }, [loading, items.length, onCount]);

  const uids = useMemo(() => items.map((i) => i.uid), [items]);
  const thumbs = useThumbnails(uids);

  // Only photos open in the viewer; a shared album is a container, not an image.
  const photos = useMemo(() => items.filter((i) => i.type === "photo"), [items]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const near: string[] = [];
    for (let d = 1; d <= 2; d++) {
      if (photos[lightboxIdx + d]) near.push(photos[lightboxIdx + d].uid);
      if (photos[lightboxIdx - d]) near.push(photos[lightboxIdx - d].uid);
    }
    prefetchPreviews(near);
  }, [lightboxIdx, photos]);

  function onOpen(uid: string) {
    const idx = photos.findIndex((p) => p.uid === uid);
    if (idx >= 0) setLightboxIdx(idx);
  }

  const current = lightboxIdx !== null ? photos[lightboxIdx] : null;

  return (
    <>
      {error && <div className="g-error">{error}</div>}

      {loading && <PhotoGridSkeleton count={12} cellSize={cellSize} />}

      {!loading && items.length === 0 && !error && (
        <div className="g-empty">
          <p className="g-empty-title">
            {tab === "by" ? t("shared.emptyByTitle") : t("shared.emptyWithTitle")}
          </p>
          <p className="g-empty-sub">
            {tab === "by" ? t("shared.emptyBySub") : t("shared.emptyWithSub")}
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <PhotoGrid
          items={items}
          thumbs={thumbs}
          cellSize={cellSize}
          onOpen={onOpen}
          showBadges={false}
          showName
          renderOverlay={(item) => {
            const it = items.find((i) => i.uid === item.uid);
            if (!it) return null;
            return (
              <div className="g-shared-badges">
                {it.isSharedPublicly && (
                  <span className="g-badge" title={t("shared.publicLink")}>
                    🔗
                  </span>
                )}
                {it.type === "album" && (
                  <span className="g-badge" title={t("shared.album")}>
                    ▤
                  </span>
                )}
              </div>
            );
          }}
        />
      )}

      {current && (
        <Lightbox
          uid={current.uid}
          fallbackUrl={thumbs[current.uid] ?? null}
          hasPrev={lightboxIdx! > 0}
          hasNext={lightboxIdx! < photos.length - 1}
          onPrev={() => setLightboxIdx((i) => (i === null ? i : Math.max(0, i - 1)))}
          onNext={() =>
            setLightboxIdx((i) => (i === null ? i : Math.min(photos.length - 1, i + 1)))
          }
          onClose={() => setLightboxIdx(null)}
          onTrashed={(uid) => {
            setItems((prev) => prev.filter((i) => i.uid !== uid));
            setLightboxIdx(null);
          }}
          onRenamed={(uid, name) =>
            setItems((prev) => prev.map((i) => (i.uid === uid ? { ...i, name } : i)))
          }
        />
      )}
    </>
  );
}
