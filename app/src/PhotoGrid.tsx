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

import { useEffect, useRef, useState, type ReactNode } from "react";
import { TAG } from "./tags";
import { cachedThumbnail, requestThumbnail } from "./thumbStore";
import { useT } from "./i18n";

export type GridItem = { uid: string; tags?: number[]; name?: string };

const gridStyle = (cellSize: number) => ({
  gridTemplateColumns: `repeat(auto-fill, minmax(${cellSize}px, 1fr))`,
});

type CellProps = {
  item: GridItem;
  /** Provided by eager callers; `undefined` means "lazy-load when visible". */
  thumb?: string | null;
  selected: boolean;
  onToggle?: (uid: string) => void;
  onOpen?: (uid: string) => void;
  showBadges?: boolean;
  showName?: boolean;
  renderOverlay?: (item: GridItem) => ReactNode;
};

/** One photo tile: thumbnail, hover select dot, type badges, optional name. */
export function PhotoCell({
  item,
  thumb,
  selected,
  onToggle,
  onOpen,
  showBadges = true,
  showName = false,
  renderOverlay,
}: CellProps) {
  const t = useT();
  // `thumb === undefined` -> lazy: fetch this cell's thumbnail only once it
  // scrolls near the viewport, from a bounded LRU, so a huge library never loads
  // every thumbnail into memory at once.
  const lazy = thumb === undefined;
  const ref = useRef<HTMLDivElement>(null);
  const [self, setSelf] = useState<string | null | undefined>(() =>
    lazy ? cachedThumbnail(item.uid) : undefined,
  );
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!lazy) return;
    const el = ref.current;
    if (!el) return;
    let unsub: (() => void) | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[entries.length - 1]?.isIntersecting;
        if (visible) {
          const cached = cachedThumbnail(item.uid);
          if (cached !== undefined) {
            setSelf(cached);
            setLoading(false);
          } else {
            setLoading(true);
            unsub = requestThumbnail(item.uid, (url) => {
              setSelf(url);
              setLoading(false);
            });
          }
        } else {
          // Scrolled far out of view: drop this cell's copy of the thumbnail so
          // a big library's per-cell strings cannot accumulate (the bounded LRU
          // still caches it for an instant re-entry). Keeps the JS heap tied to
          // what is on screen, not to the whole library.
          unsub?.();
          unsub = undefined;
          setSelf(undefined);
          setLoading(false);
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      unsub?.();
    };
  }, [lazy, item.uid]);

  const src = lazy ? self : thumb;
  return (
    <div
      className={`g-cell ${selected ? "sel" : ""}`}
      ref={ref}
      data-uid={item.uid}
      title={showName ? item.name : undefined}
      onClick={() => onOpen?.(item.uid)}
    >
      {src ? (
        <img src={src} loading="lazy" alt="" draggable={false} />
      ) : (
        <div className={`g-cell-ph${loading ? " g-cell-loading" : ""}`} />
      )}

      {onToggle && (
        <span
          className="g-seldot"
          title={selected ? t("grid.deselect") : t("grid.select")}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.uid);
          }}
        >
          {selected ? "✓" : ""}
        </span>
      )}

      {showBadges && item.tags?.includes(TAG.Video) && (
        <div className="g-play">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M5 3.5 L12 8 L5 12.5 Z" fill="#fff" />
          </svg>
        </div>
      )}
      {showBadges && item.tags?.includes(TAG.Favorite) && <div className="g-fav">♥</div>}

      {renderOverlay?.(item)}
      {showName && item.name && <div className="g-cell-name">{item.name}</div>}
    </div>
  );
}

type GridProps = Omit<CellProps, "item" | "thumb" | "selected"> & {
  items: GridItem[];
  /** Eager thumbnails; omit to let each cell lazy-load its own (large timeline). */
  thumbs?: Record<string, string | null>;
  cellSize: number;
  selected?: Set<string>;
};

/** The one photo grid, shared by Photos, Albums and Shared. */
export function PhotoGrid({ items, thumbs, cellSize, selected, ...cell }: GridProps) {
  return (
    <div className="g-grid" style={gridStyle(cellSize)}>
      {items.map((item) => (
        <PhotoCell
          key={item.uid}
          item={item}
          thumb={thumbs ? (thumbs[item.uid] ?? null) : undefined}
          selected={!!selected?.has(item.uid)}
          {...cell}
        />
      ))}
    </div>
  );
}

export function PhotoGridSkeleton({ count, cellSize }: { count: number; cellSize: number }) {
  return (
    <div className="g-grid" style={gridStyle(cellSize)}>
      {Array.from({ length: count }).map((_, i) => (
        <div className="g-cell g-skel" key={i} />
      ))}
    </div>
  );
}
