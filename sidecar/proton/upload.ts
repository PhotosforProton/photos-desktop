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

// Upload engine.
//
// Everything server-side goes through the SDK: `getFileUploader` for the bytes,
// `createAlbum` + `addPhotosToAlbum` for folders, `findPhotoDuplicates` to skip
// what is already there. Files stream straight off disk, so a large photo never
// sits in memory.
//
// Concurrency is the SDK's job, not ours: `getFileUploader` awaits its own
// queue (MAX_CONCURRENT_FILE_UPLOADS = 5), so we fire a group's files at once
// and let it throttle. Adding our own semaphore would only slow it down.
//
// RPC is request/response, so progress is state the UI polls. Drops accumulate:
// a second drop while one is running just appends to the queue.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { Readable } from "node:stream";

import exifr from "exifr";
import sharp from "sharp";
import { ThumbnailType } from "@protontech/drive-sdk";

const IMAGE_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".dng": "image/x-adobe-dng",
};

const VIDEO_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".webm": "video/webm",
  ".mkv": "video/x-matroska",
  ".3gp": "video/3gpp",
};

/** sharp cannot decode these, so they upload without a thumbnail. */
const SHARP_CANNOT_DECODE = new Set([".heic", ".heif", ".dng"]);

const THUMB_SMALL_PX = 512;
const THUMB_PREVIEW_PX = 1920;

export type UploadItemStatus = "pending" | "uploading" | "done" | "skipped" | "failed";

export type UploadItem = {
  name: string;
  album: string | null;
  status: UploadItemStatus;
  error?: string;
};

export type UploadStatus = {
  running: boolean;
  total: number;
  done: number;
  skipped: number;
  failed: number;
  items: UploadItem[];
};

type Group = { album: string | null; files: string[]; startIndex: number };

const status: UploadStatus = {
  running: false,
  total: 0,
  done: 0,
  skipped: 0,
  failed: 0,
  items: [],
};

let queue: Group[] = [];
let draining = false;
let abort = new AbortController();

export function getUploadStatus(): UploadStatus {
  return status;
}

export function cancelUpload(): void {
  queue = [];
  abort.abort();
}

/** Drops finished rows so a long-lived panel does not grow forever. */
export function clearFinishedUploads(): void {
  if (status.running) return;
  status.items = [];
  status.total = 0;
  status.done = 0;
  status.skipped = 0;
  status.failed = 0;
}

function mediaTypeOf(path: string): string | null {
  const ext = extname(path).toLowerCase();
  return IMAGE_TYPES[ext] ?? VIDEO_TYPES[ext] ?? null;
}

async function listMedia(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && mediaTypeOf(e.name))
    .map((e) => join(dir, e.name))
    .sort();
}

function sha1Of(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha1");
    createReadStream(path)
      .on("data", (chunk) => hash.update(chunk))
      .on("error", reject)
      .on("end", () => resolve(hash.digest("hex")));
  });
}

/** EXIF capture time when the photo carries one, otherwise the file's mtime. */
async function captureTimeOf(path: string, fallback: Date): Promise<Date> {
  try {
    const exif = await exifr.parse(path, ["DateTimeOriginal", "CreateDate"]);
    const taken = exif?.DateTimeOriginal ?? exif?.CreateDate;
    if (taken instanceof Date && !Number.isNaN(taken.getTime())) return taken;
  } catch {
    /* not an image, or no EXIF */
  }
  return fallback;
}

/** A small grid thumbnail and an HD preview. Empty when we cannot decode. */
async function makeThumbnails(path: string, mediaType: string): Promise<any[]> {
  const ext = extname(path).toLowerCase();
  if (!mediaType.startsWith("image/") || SHARP_CANNOT_DECODE.has(ext)) return [];
  try {
    const source = sharp(path, { failOn: "none" }).rotate(); // honour EXIF orientation
    const [small, preview] = await Promise.all([
      source
        .clone()
        .resize(THUMB_SMALL_PX, THUMB_SMALL_PX, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer(),
      source
        .clone()
        .resize(THUMB_PREVIEW_PX, THUMB_PREVIEW_PX, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toBuffer(),
    ]);
    return [
      { type: ThumbnailType.Type1, thumbnail: new Uint8Array(small) },
      { type: ThumbnailType.Type2, thumbnail: new Uint8Array(preview) },
    ];
  } catch {
    return []; // a thumbnail is never worth failing the upload over
  }
}

/** Uploads one file. Returns its node uid, or null when it was a duplicate. */
async function uploadOne(photos: any, path: string, signal: AbortSignal): Promise<string | null> {
  const name = basename(path);
  const mediaType = mediaTypeOf(path);
  if (!mediaType) throw new Error("unsupported file type");

  const info = await stat(path);
  const sha1 = await sha1Of(path);

  const duplicates: string[] = await photos.findPhotoDuplicates(name, async () => sha1, signal);
  if (duplicates.length > 0) return null;

  const captureTime = await captureTimeOf(path, info.mtime);
  const thumbnails = await makeThumbnails(path, mediaType);

  // Blocks here until the SDK's upload queue has capacity.
  const uploader = await photos.getFileUploader(
    name,
    {
      mediaType,
      expectedSize: info.size,
      expectedSha1: sha1,
      modificationTime: info.mtime,
      captureTime,
    },
    signal,
  );

  // The SDK wants a web ReadableStream; Node gives us one straight off the disk
  // stream, so a large photo is never buffered in memory.
  const stream = Readable.toWeb(createReadStream(path)) as any;
  const controller = await uploader.uploadFromStream(stream, thumbnails);
  const { nodeUid } = await controller.completion();
  return nodeUid;
}

/** Turns dropped paths into groups. A folder is one group, loose files another. */
async function planGroups(paths: string[]): Promise<Group[]> {
  const groups: Group[] = [];
  const loose: string[] = [];

  for (const path of paths) {
    let info;
    try {
      info = await stat(path);
    } catch {
      continue;
    }
    if (info.isDirectory()) {
      const files = await listMedia(path);
      if (files.length > 0) groups.push({ album: basename(path), files, startIndex: 0 });
    } else if (mediaTypeOf(path)) {
      loose.push(path);
    }
  }
  if (loose.length > 0) groups.push({ album: null, files: loose, startIndex: 0 });
  return groups;
}

async function drain(photos: any): Promise<void> {
  draining = true;
  status.running = true;

  try {
    while (queue.length > 0 && !abort.signal.aborted) {
      const group = queue.shift()!;

      let albumUid: string | null = null;
      if (group.album) {
        try {
          albumUid = (await photos.createAlbum(group.album)).uid;
        } catch (e) {
          // Without the album these photos would silently land on the timeline,
          // which is not what was asked for, so fail the group instead.
          for (let i = 0; i < group.files.length; i++) {
            const item = status.items[group.startIndex + i];
            item.status = "failed";
            item.error = `could not create album: ${(e as Error).message}`;
            status.failed++;
          }
          continue;
        }
      }

      const uploaded: string[] = [];

      // Fire them all: the SDK's own queue caps this at 5 concurrent files.
      await Promise.all(
        group.files.map(async (file, i) => {
          const item = status.items[group.startIndex + i];
          if (abort.signal.aborted) return;
          item.status = "uploading";
          try {
            const uid = await uploadOne(photos, file, abort.signal);
            if (uid) {
              uploaded.push(uid);
              item.status = "done";
              status.done++;
            } else {
              item.status = "skipped";
              item.error = "already in your library";
              status.skipped++;
            }
          } catch (e) {
            item.status = "failed";
            item.error = (e as Error).message;
            status.failed++;
          }
        }),
      );

      if (albumUid && uploaded.length > 0) {
        try {
          for await (const result of photos.addPhotosToAlbum(albumUid, uploaded, abort.signal)) {
            if (!result.ok) process.stderr.write(`[upload] add to album failed: ${result.uid}\n`);
          }
        } catch (e) {
          process.stderr.write(`[upload] addPhotosToAlbum: ${(e as Error).message}\n`);
        }
      }
    }
  } catch (e) {
    process.stderr.write(`[upload] drain failed: ${(e as Error).stack ?? String(e)}\n`);
  } finally {
    draining = false;
    status.running = false;
    if (abort.signal.aborted) abort = new AbortController(); // ready for the next drop
    // A cancel aborts the while loop even when a new batch was appended during
    // the abort->finally window; pick that pending work up instead of stranding it.
    if (queue.length > 0) void drain(photos);
  }
}

/**
 * Plain files land on the timeline. A folder becomes an album named after it,
 * and the media inside is uploaded into that album. Safe to call while an
 * upload is already running: the new work is appended.
 */
export function startUpload(photos: any, paths: string[]): void {
  void (async () => {
    const groups = await planGroups(paths);
    if (groups.length === 0) return;

    for (const group of groups) {
      group.startIndex = status.items.length;
      for (const file of group.files) {
        status.items.push({ name: basename(file), album: group.album, status: "pending" });
      }
      queue.push(group);
    }
    status.total = status.items.length;

    if (!draining) void drain(photos);
  })();
}
