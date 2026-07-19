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
//
// Thumbnails are sharp's work, which makes them a still-image affair: handed a video it
// can do nothing, and every video used to upload with no thumbnail at all. The frames now
// arrive alongside the paths, already made: the host asked Windows for a picture of each
// video before the upload started and staged it as a JPEG, which sharp reads as happily
// as it reads a photo. Nothing here decodes video, and nothing here knows about Windows.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, rm, stat } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { Readable } from "node:stream";

import exifr from "exifr";
import sharp from "sharp";

import { createAlbum } from "./albums.ts";
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

/**
 * Drive photo tag ids. The server rejects anything outside 0..9, so these are the only
 * values that may ever be sent.
 */
const TAG_SCREENSHOT = 1;
const TAG_VIDEO = 2;
const TAG_RAW = 9;

/**
 * Raw stills, by extension, matching the set the Android client tags. Only `.dng` can
 * reach this today because the rest are not in `IMAGE_TYPES` and so cannot be uploaded
 * at all; listing them costs nothing and keeps the two clients agreeing if that list
 * ever grows.
 */
const RAW_EXTENSIONS = new Set([
  ".dng",
  ".cr2",
  ".cr3",
  ".nef",
  ".arw",
  ".raf",
  ".orf",
  ".rw2",
  ".pef",
  ".srw",
]);

const THUMB_SMALL_PX = 512;
const THUMB_PREVIEW_PX = 1920;

/**
 * What the host asked Windows about one file, for the types this side cannot open.
 *
 * A duration exists only once something has decoded the container, and nothing here
 * decodes video, so it arrives with the frames or not at all. Every field is optional:
 * a machine with no codec for a container answers nothing, and nothing is what gets
 * stored rather than a zero standing in for it.
 */
export type ShellMediaInfo = { width?: number; height?: number; durationSec?: number };

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

type Group = {
  album: string | null;
  files: string[];
  startIndex: number;
  /** This group's staged frames, by `frameKey`. Empty unless the group holds video. */
  frames: Map<string, string>;
  /** What the shell knew about those same files, by `frameKey`. */
  media: Map<string, ShellMediaInfo>;
};

/**
 * One spelling of a path, so both sides of the frame lookup agree.
 *
 * The host names a frame by the path it was made from, and this side looks one up by the
 * path it is about to upload. The two are the same file but need not be the same string:
 * a folder's files are built by joining, a dropped file arrives as the shell spelled it,
 * and Windows does not care about case in either. Matching on the raw string would throw
 * a perfectly good thumbnail away over a capital letter.
 */
export function frameKey(path: string): string {
  return path.replace(/\//g, "\\").toLowerCase();
}

/**
 * The entries belonging to one group's files, keyed for lookup.
 *
 * A drop is split into groups before this runs, so each group is handed only its own,
 * which is what lets a group discard its frames the moment it is finished with them.
 *
 * Generic over the value because the host returns two maps against the same keys, the
 * staged frames and what the shell knew about the same files, and both are split the
 * same way.
 */
export function framesForFiles<T>(files: string[], frames: Record<string, T>): Map<string, T> {
  const byKey = new Map(Object.entries(frames).map(([path, value]) => [frameKey(path), value]));
  const mine = new Map<string, T>();
  for (const file of files) {
    const key = frameKey(file);
    const value = byKey.get(key);
    if (value !== undefined) mine.set(key, value);
  }
  return mine;
}

/**
 * Delete whatever frames a group still holds.
 *
 * Called when a group is done with, however it ended: uploaded, skipped as a duplicate,
 * failed, or cancelled before it ever ran. `force` makes it idempotent, which matters
 * because the ordinary path has already deleted each frame as it was spent.
 */
async function discardFrames(group: Group): Promise<void> {
  for (const frame of group.frames.values()) {
    await rm(frame, { force: true }).catch(() => {});
  }
  group.frames.clear();
}

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
  // The groups still waiting hold frames nothing will ever spend now. The one already
  // draining cleans up after itself when it unwinds.
  for (const group of queue) void discardFrames(group);
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

/**
 * The Drive photo tags that apply to one file, from its media type and its name alone.
 *
 * Without these a video uploaded here reached Proton carrying no tag at all, and the
 * clients that read video-ness off the tag then showed it as a still photo.
 *
 * Only tags that follow from what is already known are set. Video and Raw are exact:
 * one is the media type, the other the container. Screenshot is a filename convention
 * rather than a fact about the bytes, and is the same rule the Android client uses, so
 * the same file classifies alike whichever client sent it.
 *
 * Deliberately absent: Live/Motion photo and Panorama, which live in the file's XMP and
 * would need a prefix read this never does; and Favorite, Selfie, Portrait and Burst,
 * which nothing on a desktop can determine. Guessing any of them from aspect ratio or
 * size would only be an invention.
 */
export function photoTagsFor(mediaType: string, name: string): number[] {
  const tags: number[] = [];
  const mime = mediaType.toLowerCase();
  const lower = name.toLowerCase();
  const ext = extname(lower);

  if (mime.startsWith("image/") && (lower.startsWith("screenshot") || lower.startsWith("screen_shot"))) {
    tags.push(TAG_SCREENSHOT);
  }
  if (mime.startsWith("video/")) tags.push(TAG_VIDEO);
  if (RAW_EXTENSIONS.has(ext)) tags.push(TAG_RAW);

  return tags;
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

/** Whether sharp can open this file itself, which is also what decides where its
 *  dimensions come from: its own reading of the file, or what the shell said. */
function sharpCanDecode(path: string, mediaType: string): boolean {
  return mediaType.startsWith("image/") && !SHARP_CANNOT_DECODE.has(extname(path).toLowerCase());
}

/**
 * The dimensions a file is displayed at, which is what has to be stored.
 *
 * EXIF orientations 5 to 8 turn the image onto its other edge, so the stored width and
 * height are the ones a viewer draws rather than the ones in the header. Recording the
 * unturned pair would report a portrait phone photo as a landscape one.
 *
 * Null unless both edges are real positive numbers: a single edge is not a dimension,
 * and a zero is not a measurement.
 */
export function displayDimensions(
  width: number | undefined,
  height: number | undefined,
  orientation: number | undefined,
): { width: number; height: number } | null {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  const turned = typeof orientation === "number" && orientation >= 5 && orientation <= 8;
  return turned
    ? { width: Math.round(h), height: Math.round(w) }
    : { width: Math.round(w), height: Math.round(h) };
}

/** What a photo says about where and on what it was taken. */
export type PhotoAttributes = {
  Media?: { Width?: number; Height?: number; Duration?: number };
  Location?: { Latitude: number; Longitude: number };
  Camera?: { Device?: string };
};

/**
 * The extended attributes of one file, or nothing at all to say.
 *
 * Drive shapes these as `{"Common":{...},"Media":{...},"Location":{...},"Camera":{...}}`,
 * and the SDK writes `Common` itself and merges this alongside it. **Duration is in
 * SECONDS**, which is the unit the readers on the other side scale by a thousand.
 *
 * `Location` is what puts a photo on a map. The coordinate is inside the file's own EXIF
 * either way, since the bytes upload untouched, but Proton's clients read the place from
 * this block rather than by opening the file, so a photo without it is a photo the map
 * cannot find.
 *
 * Nothing known means `undefined` rather than an empty block, so a file this can say
 * nothing about uploads with exactly the attributes it always had. A zero is never
 * written for a measurement: absent means unknown, whereas a zero would be read as an
 * answer. A coordinate is the exception, where 0 is a real place, so those are kept on
 * range and finiteness alone.
 */
export function mediaAttributes(info: {
  width?: number | null;
  height?: number | null;
  durationSec?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  device?: string | null;
}): PhotoAttributes | undefined {
  const out: PhotoAttributes = {};
  const media: { Width?: number; Height?: number; Duration?: number } = {};

  // No orientation to apply: both sources hand over dimensions already the way round they
  // are displayed, so this is reusing the same checks on a pair that needs no turning.
  const dims = displayDimensions(info.width ?? undefined, info.height ?? undefined, undefined);
  if (dims) {
    media.Width = dims.width;
    media.Height = dims.height;
  }
  const duration = Number(info.durationSec);
  if (Number.isFinite(duration) && duration > 0) media.Duration = duration;
  if (Object.keys(media).length > 0) out.Media = media;

  // Both halves or neither: half a coordinate is not a place, and writing one of them
  // would put the photo on the equator or the prime meridian rather than nowhere.
  const lat = Number(info.latitude);
  const lon = Number(info.longitude);
  if (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  ) {
    out.Location = { Latitude: lat, Longitude: lon };
  }

  const device = (info.device ?? "").trim();
  if (device) out.Camera = { Device: device.slice(0, 128) };

  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * A still's displayed dimensions, read from its header.
 *
 * Only ever called for a file sharp can open, which is the same file it is about to
 * thumbnail, so this costs a header read and never a decode. A video's dimensions can
 * not come from here: what sharp is handed for one of those is the staged frame, whose
 * size is the thumbnail's rather than the video's.
 */
async function stillDimensions(path: string): Promise<{ width: number; height: number } | null> {
  try {
    const meta = await sharp(path).metadata();
    return displayDimensions(meta.width, meta.height, meta.orientation);
  } catch {
    return null; // unreadable header: the upload is still what was asked for
  }
}

/** EXIF capture time when the photo carries one, otherwise the file's mtime. */
/**
 * One readable name from EXIF's separate make and model fields.
 *
 * "Apple iPhone 15" reads better than the two apart, but the model often already opens
 * with the make, and Samsung and Google both write it that way. Joining blindly gives
 * "samsung SM-S901B" as "samsung samsung SM-S901B".
 */
export function deviceName(make?: unknown, model?: unknown): string {
  const mk = String(make ?? "").trim();
  const md = String(model ?? "").trim();
  if (md && mk && !md.toLowerCase().startsWith(mk.toLowerCase())) return `${mk} ${md}`;
  return md || mk;
}

/** What one EXIF read can tell about a photo. Every field is absent when unknown. */
type ExifFacts = {
  captureTime: Date;
  latitude?: number;
  longitude?: number;
  device?: string;
};

/**
 * Read the file's EXIF once, for everything taken from it.
 *
 * One parse rather than one per fact: this runs for every file in an upload, and the
 * reader opens and scans the header each time it is called.
 *
 * `gps: true` is what turns the raw coordinate fields into signed `latitude` and
 * `longitude`. Read separately they arrive as degrees, minutes and seconds with the
 * hemisphere in a neighbouring field, and a photo south or west of zero would upload
 * on the wrong side of the planet.
 */
async function exifFactsOf(path: string, fallback: Date): Promise<ExifFacts> {
  const facts: ExifFacts = { captureTime: fallback };
  try {
    const exif = await exifr.parse(path, {
      pick: ["DateTimeOriginal", "CreateDate", "Make", "Model", "latitude", "longitude"],
      gps: true,
    });
    const taken = exif?.DateTimeOriginal ?? exif?.CreateDate;
    if (taken instanceof Date && !Number.isNaN(taken.getTime())) facts.captureTime = taken;
    if (typeof exif?.latitude === "number") facts.latitude = exif.latitude;
    if (typeof exif?.longitude === "number") facts.longitude = exif.longitude;
    const device = deviceName(exif?.Make, exif?.Model);
    if (device) facts.device = device;
  } catch {
    /* not an image, or no EXIF */
  }
  return facts;
}

/**
 * A small grid thumbnail and an HD preview. Empty when the file cannot be decoded.
 *
 * `framePath` is a picture of this file the host already made, and it is the only way a
 * video reaches sharp at all. Without one the rule is exactly what it has always been:
 * stills sharp can decode get thumbnails, and anything else uploads without.
 */
async function makeThumbnails(
  path: string,
  mediaType: string,
  framePath?: string,
): Promise<any[]> {
  const input = framePath ?? path;
  if (!framePath && !sharpCanDecode(path, mediaType)) return [];
  try {
    // A staged frame carries no EXIF, so the turn below finds nothing to apply and the
    // shell's own right-way-up picture is left as it is. An ordinary photo is unaffected.
    const source = sharp(input, { failOn: "none" }).rotate(); // honour EXIF orientation
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
  } finally {
    // Spent either way: a frame sharp choked on is no more use than one it read.
    if (framePath) await rm(framePath, { force: true }).catch(() => {});
  }
}

/** Uploads one file. Returns its node uid, or null when it was a duplicate. */
async function uploadOne(
  photos: any,
  path: string,
  framePath: string | undefined,
  shellMedia: ShellMediaInfo | undefined,
  signal: AbortSignal,
): Promise<string | null> {
  const name = basename(path);
  const mediaType = mediaTypeOf(path);
  if (!mediaType) throw new Error("unsupported file type");

  const info = await stat(path);
  const sha1 = await sha1Of(path);

  const duplicates: string[] = await photos.findPhotoDuplicates(name, async () => sha1, signal);
  if (duplicates.length > 0) return null;

  const exif = await exifFactsOf(path, info.mtime);
  const captureTime = exif.captureTime;

  // Dimensions come from whichever side actually opened the file. The shell answered for
  // a video and for the stills sharp has no decoder for; everything else sharp reads
  // itself, off the same file it is about to thumbnail. The two never cover the same
  // file, so neither can contradict the other.
  const dims =
    shellMedia?.width && shellMedia?.height
      ? { width: shellMedia.width, height: shellMedia.height }
      : sharpCanDecode(path, mediaType)
        ? await stillDimensions(path)
        : null;

  const thumbnails = await makeThumbnails(path, mediaType, framePath);

  // Blocks here until the SDK's upload queue has capacity. The tags ride along with the
  // rest of the metadata and the SDK commits them with the revision, which is the one
  // moment they can be set without a second round trip.
  const uploader = await photos.getFileUploader(
    name,
    {
      mediaType,
      expectedSize: info.size,
      expectedSha1: sha1,
      modificationTime: info.mtime,
      captureTime,
      tags: photoTagsFor(mediaType, name),
      // The SDK writes the `Common` block itself and merges this beside it, so this
      // carries only what it does not already know. A file nothing could be learned
      // about passes `undefined` and uploads with exactly the attributes it always had.
      additionalMetadata: mediaAttributes({
        width: dims?.width,
        height: dims?.height,
        durationSec: shellMedia?.durationSec,
        latitude: exif.latitude,
        longitude: exif.longitude,
        device: exif.device,
      }),
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
      if (files.length > 0) {
        groups.push({
          album: basename(path),
          files,
          startIndex: 0,
          frames: new Map(),
          media: new Map(),
        });
      }
    } else if (mediaTypeOf(path)) {
      loose.push(path);
    }
  }
  if (loose.length > 0) {
    groups.push({ album: null, files: loose, startIndex: 0, frames: new Map(), media: new Map() });
  }
  return groups;
}

async function drain(photos: any): Promise<void> {
  draining = true;
  status.running = true;

  try {
    while (queue.length > 0 && !abort.signal.aborted) {
      const group = queue.shift()!;
      // However this group ends, its frames go with it. A duplicate never reaches the
      // thumbnailer that would have spent one, an album that could not be created skips
      // the whole group, and a cancel leaves the rest untouched.
      try {
        // Never log the album name: it is the user's own folder name, which is
        // routinely a person's name. The destination kind and the count are enough
        // to follow an upload in the log.
        process.stderr.write(
          `[upload] start ${group.album ? "album" : "timeline"}: ${group.files.length} files\n`,
        );

        let albumUid: string | null = null;
        if (group.album) {
          try {
            albumUid = (await createAlbum(photos, group.album)).uid;
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
              const key = frameKey(file);
              const uid = await uploadOne(
                photos,
                file,
                group.frames.get(key),
                group.media.get(key),
                abort.signal,
              );
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
          // Add the files that DID upload to their album even if the user cancelled:
          // they are already in the cloud, so finishing this beats leaving an empty
          // album with the photos orphaned on the timeline. A fresh signal, so the
          // cancel that stopped the uploads does not also abort this last step.
          const addSignal = new AbortController().signal;
          try {
            let failed = 0;
            for await (const result of photos.addPhotosToAlbum(albumUid, uploaded, addSignal)) {
              if (!result.ok) failed++;
            }
            if (failed > 0) {
              process.stderr.write(`[upload] add to album failed for ${failed} photo(s)\n`);
            }
          } catch (e) {
            process.stderr.write(`[upload] addPhotosToAlbum: ${(e as Error).message}\n`);
          }
        }
        process.stderr.write(
          `[upload] done ${group.album ? "album" : "timeline"}: ${uploaded.length}/${group.files.length} uploaded\n`,
        );
      } finally {
        await discardFrames(group);
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
 *
 * `frames` maps a path to a picture of it the host staged, for the files sharp cannot
 * open by itself. It is optional in the strictest sense: without it every video uploads
 * exactly as it did before, thumbnail and all missing. `media` is what the shell knew
 * about those same files and is optional on the same terms.
 */
export function startUpload(
  photos: any,
  paths: string[],
  frames: Record<string, string> = {},
  media: Record<string, ShellMediaInfo> = {},
): void {
  void (async () => {
    const groups = await planGroups(paths);
    if (groups.length === 0) {
      // Nothing in this drop is uploadable, so nothing will ever spend these.
      for (const frame of Object.values(frames)) {
        await rm(frame, { force: true }).catch(() => {});
      }
      return;
    }

    for (const group of groups) {
      group.startIndex = status.items.length;
      group.frames = framesForFiles(group.files, frames);
      group.media = framesForFiles(group.files, media);
      for (const file of group.files) {
        status.items.push({ name: basename(file), album: group.album, status: "pending" });
      }
      queue.push(group);
    }
    status.total = status.items.length;

    if (!draining) void drain(photos);
  })();
}
