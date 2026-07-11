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
 * Shared HD-preview cache and prefetcher.
 *
 * The SDK only exposes the fetch (`iterateThumbnails` with the HD type); there is
 * no prefetch or index, so we own it. The sidecar already keeps decrypted
 * thumbnails in its encrypted on-disk cache, so a warmed neighbour is a local
 * read rather than a download.
 *
 * In-flight requests are deduplicated: opening a photo the prefetcher is already
 * loading joins that request rather than issuing a second one.
 */
const cache = new Map<string, string | null>();
const inFlight = new Map<string, Promise<string | null>>();

// Bound the HD-preview cache: without a cap, stepping through the lightbox keeps
// every 1920px data-URL in memory until reload. Map preserves insertion order,
// so `touch` (delete + re-set, evict oldest over the cap) gives a simple LRU.
const MAX_PREVIEWS = 48;

function touch(uid: string, url: string | null): void {
  cache.delete(uid);
  cache.set(uid, url);
  while (cache.size > MAX_PREVIEWS) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

export function cachedPreview(uid: string): string | null | undefined {
  const hit = cache.get(uid);
  if (hit !== undefined) touch(uid, hit); // mark most-recently-used
  return hit;
}

/** How many HD previews are currently retained (for the debug HUD). */
export function previewCacheSize(): number {
  return cache.size;
}

export function loadPreview(uid: string): Promise<string | null> {
  const hit = cache.get(uid);
  if (hit !== undefined) {
    touch(uid, hit);
    return Promise.resolve(hit);
  }

  const existing = inFlight.get(uid);
  if (existing) return existing;

  const request = rpc<string | null>("getPreview", { uid })
    .then((url) => {
      touch(uid, url);
      inFlight.delete(uid);
      return url;
    })
    .catch(() => {
      inFlight.delete(uid);
      return null; // a failed preview falls back to the grid thumbnail
    });

  inFlight.set(uid, request);
  return request;
}

/** Warm neighbours so stepping through the lightbox is instant. */
export function prefetchPreviews(uids: string[]): void {
  for (const uid of uids) {
    if (cache.has(uid) || inFlight.has(uid)) continue;
    void loadPreview(uid);
  }
}

/** Called after a rename or trash so a stale entry cannot be served. */
export function dropPreview(uid: string): void {
  cache.delete(uid);
  inFlight.delete(uid);
}
