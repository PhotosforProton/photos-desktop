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

import { useCallback, useEffect, useRef, useState, type MouseEvent, type RefObject } from "react";
import { useT } from "../lib/i18n";

export type MarqueeRect = { x1: number; y1: number; x2: number; y2: number };

const DRAG_THRESHOLD_PX = 5;

/**
 * Rubber-band selection over anything in `containerRef` carrying `data-uid`.
 *
 * Sweeping a cell flips it against the selection the drag started from, so
 * dragging back across an already selected photo clears it, as on Android. A
 * press that never moves stays a plain click, so cells can still be opened.
 *
 * Shared by every grid in the app: Photos, Albums, Shared.
 */
export function useSelection(containerRef: RefObject<HTMLElement | null>, escEnabled = true) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [marquee, setMarquee] = useState<MarqueeRect | null>(null);
  const dragRef = useRef<{ x: number; y: number; active: boolean; base: Set<string> } | null>(null);
  const draggedRef = useRef(false);

  const clear = useCallback(() => setSelected(new Set()), []);

  const toggle = useCallback((uid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }, []);

  // Escape abandons the selection. Disable this while a lightbox or dialog owns
  // the key, so it does not fire twice.
  useEffect(() => {
    if (!escEnabled || selected.size === 0) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") clear();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [escEnabled, selected.size, clear]);

  function onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest(".g-seldot")) return; // the dot handles itself
    dragRef.current = { x: e.clientX, y: e.clientY, active: false, base: new Set(selected) };
    draggedRef.current = false;
  }

  function onMouseMove(e: MouseEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    if (!drag.active) {
      if (
        Math.abs(e.clientX - drag.x) < DRAG_THRESHOLD_PX &&
        Math.abs(e.clientY - drag.y) < DRAG_THRESHOLD_PX
      ) {
        return;
      }
      drag.active = true;
      draggedRef.current = true;
    }

    const rect: MarqueeRect = {
      x1: Math.min(drag.x, e.clientX),
      y1: Math.min(drag.y, e.clientY),
      x2: Math.max(drag.x, e.clientX),
      y2: Math.max(drag.y, e.clientY),
    };
    setMarquee(rect);

    const next = new Set(drag.base);
    containerRef.current?.querySelectorAll<HTMLElement>("[data-uid]").forEach((el) => {
      const uid = el.dataset.uid;
      if (!uid) return;
      const r = el.getBoundingClientRect();
      const hits = r.left < rect.x2 && r.right > rect.x1 && r.top < rect.y2 && r.bottom > rect.y1;
      if (!hits) return;
      if (drag.base.has(uid)) next.delete(uid);
      else next.add(uid);
    });
    setSelected(next);
  }

  function onMouseUp() {
    dragRef.current = null;
    setMarquee(null);
    // Swallow the click a drag emits, then re-arm for the next real click.
    if (draggedRef.current) setTimeout(() => (draggedRef.current = false), 0);
  }

  return {
    selected,
    setSelected,
    toggle,
    clear,
    marquee,
    wasDragging: () => draggedRef.current,
    containerProps: { onMouseDown, onMouseMove, onMouseUp, onMouseLeave: onMouseUp },
  };
}

export function Marquee({ rect }: { rect: MarqueeRect | null }) {
  if (!rect) return null;
  return (
    <div
      className="g-marquee"
      style={{
        left: rect.x1,
        top: rect.y1,
        width: rect.x2 - rect.x1,
        height: rect.y2 - rect.y1,
      }}
    />
  );
}

export function SelectionBar({
  count,
  onCancel,
  onTrash,
  onDownload,
  onFreeUp,
}: {
  count: number;
  onCancel: () => void;
  onTrash: () => void;
  onDownload?: () => void;
  onFreeUp?: () => void;
}) {
  const t = useT();
  if (count === 0) return null;
  return (
    <div className="g-selbar">
      <button className="g-selx" title={t("selection.cancel")} onClick={onCancel}>
        ✕
      </button>
      <span className="g-selcount">
        {t(count === 1 ? "selection.count.one" : "selection.count.other", { count })}
      </span>
      {onDownload && (
        <button className="g-selbtn" onClick={onDownload}>
          {t("selection.download")}
        </button>
      )}
      {onFreeUp && (
        <button className="g-selbtn" onClick={onFreeUp}>
          {t("selection.freeUp")}
        </button>
      )}
      <button className="g-selbtn danger" onClick={onTrash}>
        {t("selection.trash")}
      </button>
    </div>
  );
}
