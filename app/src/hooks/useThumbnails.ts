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

import { useEffect, useState } from "react";
import { rpc } from "../lib/rpc";
import { isLightboxOpen } from "../lib/lightboxSignal";

/**
 * Streams decrypted thumbnails for a set of nodes, in batches, so the grid can
 * paint as they arrive. The sidecar serves repeats from its encrypted on-disk
 * cache, so revisiting a view is cheap.
 */
export function useThumbnails(uids: string[]): Record<string, string | null> {
  const [thumbs, setThumbs] = useState<Record<string, string | null>>({});
  const key = uids.join(",");

  useEffect(() => {
    // An empty list leaves the record alone: that is a view standing down rather than
    // one showing nothing (Albums blanks its cover list while an album is open, and
    // wants those covers back on the way out).
    if (uids.length === 0) return;

    // Everything this list does not show goes. The record only ever grew before, so
    // browsing a few large albums in one visit ended up holding every decoded thumbnail
    // from all of them at once. Pruning rather than emptying is what keeps the tiles
    // still on screen from blinking back to placeholders on every change to the list.
    setThumbs((prev) => {
      const kept: Record<string, string | null> = {};
      for (const uid of uids) if (uid in prev) kept[uid] = prev[uid];
      return Object.keys(kept).length === Object.keys(prev).length ? prev : kept;
    });

    let cancelled = false;

    (async () => {
      // Small chunks so an interactive request never waits behind a big eager
      // fill on the single channel; the API itself caps at 30 ids.
      const BATCH = 8;
      for (let i = 0; i < uids.length && !cancelled; i += BATCH) {
        // Stand aside while the viewer is open, so opening a photo here does not
        // queue behind this fill. Resumes when the viewer closes.
        while (!cancelled && isLightboxOpen()) {
          await new Promise((r) => setTimeout(r, 150));
        }
        if (cancelled) return;
        const chunk = uids.slice(i, i + BATCH);
        try {
          const res = await rpc<{ uid: string; dataUrl: string | null }[]>("getThumbnails", {
            uids: chunk,
          });
          if (cancelled) return;
          setThumbs((prev) => {
            const next = { ...prev };
            for (const r of res) next[r.uid] = r.dataUrl;
            return next;
          });
        } catch {
          /* one bad batch must not stop the rest */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return thumbs;
}
