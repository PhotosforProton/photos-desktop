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
import { rpc } from "./rpc";

/**
 * Streams decrypted thumbnails for a set of nodes, in batches, so the grid can
 * paint as they arrive. The sidecar serves repeats from its encrypted on-disk
 * cache, so revisiting a view is cheap.
 */
export function useThumbnails(uids: string[]): Record<string, string | null> {
  const [thumbs, setThumbs] = useState<Record<string, string | null>>({});
  const key = uids.join(",");

  useEffect(() => {
    if (uids.length === 0) return;
    let cancelled = false;

    (async () => {
      const BATCH = 30; // the API caps thumbnail requests at 30 ids
      for (let i = 0; i < uids.length && !cancelled; i += BATCH) {
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
