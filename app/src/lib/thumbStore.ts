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

import { rpc } from "./rpc";

/**
 * Lazy, bounded thumbnail loader for the grid. Cells subscribe when they scroll
 * into view; requests are batched (the API caps at 30 ids) and the decrypted
 * data-URLs are held in a small LRU, so total retained bytes stay bounded no
 * matter how large the library is. The sidecar serves repeats from its encrypted
 * on-disk cache, so re-entering a view is cheap.
 */
const cache = new Map<string, string | null>();
const MAX = 500; // the visible grid plus a generous scroll buffer
const subs = new Map<string, Set<(url: string | null) => void>>();
const pending = new Set<string>();
let timer: ReturnType<typeof setTimeout> | undefined;
let flushing = false;

function touch(uid: string, url: string | null): void {
  cache.delete(uid);
  cache.set(uid, url);
  while (cache.size > MAX) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

export function cachedThumbnail(uid: string): string | null | undefined {
  const hit = cache.get(uid);
  if (hit !== undefined) touch(uid, hit);
  return hit;
}

/** How many decrypted thumbnails are currently retained (for the debug HUD). */
export function thumbCacheSize(): number {
  return cache.size;
}

async function flush(): Promise<void> {
  timer = undefined;
  if (flushing) return; // one drain loop at a time; it re-reads `pending` each batch
  flushing = true;
  const BATCH = 30;
  while (pending.size > 0) {
    // Newest-requested first, so the page you just scrolled to decrypts before the
    // rows queued earlier; and skip any that scrolled back out of view (no
    // subscribers), so no decrypt is spent on off-screen cells. New requests that
    // arrive mid-drain (you keep scrolling) are picked up on the next batch.
    const ordered = [...pending].reverse().filter((uid) => subs.has(uid));
    if (ordered.length === 0) {
      pending.clear();
      break;
    }
    const chunk = ordered.slice(0, BATCH);
    for (const uid of chunk) pending.delete(uid);
    try {
      const res = await rpc<{ uid: string; dataUrl: string | null }[]>("getThumbnails", {
        uids: chunk,
      });
      for (const r of res) {
        touch(r.uid, r.dataUrl);
        const set = subs.get(r.uid);
        if (set) for (const cb of set) cb(r.dataUrl);
      }
    } catch {
      /* one bad batch must not stop the rest */
    }
  }
  flushing = false;
}

/** Request a thumbnail for a now-visible cell. Returns an unsubscribe. */
export function requestThumbnail(uid: string, cb: (url: string | null) => void): () => void {
  const hit = cache.get(uid);
  if (hit !== undefined) {
    touch(uid, hit);
    cb(hit);
    return () => {};
  }
  let set = subs.get(uid);
  if (!set) {
    set = new Set();
    subs.set(uid, set);
  }
  set.add(cb);
  pending.add(uid);
  if (timer === undefined) timer = setTimeout(flush, 40);
  return () => {
    const s = subs.get(uid);
    if (s) {
      s.delete(cb);
      if (s.size === 0) subs.delete(uid);
    }
  };
}
