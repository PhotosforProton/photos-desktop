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

import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import sharp from "sharp";
import { ThumbnailType } from "@protontech/drive-sdk";

import {
  clearFinishedUploads,
  displayDimensions,
  frameKey,
  framesForFiles,
  getUploadStatus,
  deviceName,
  mediaAttributes,
  photoTagsFor,
  startUpload,
  type UploadStatus,
} from "./upload.ts";

const work = mkdtempSync(join(tmpdir(), "pfp-upload-test-"));
afterAll(() => rmSync(work, { recursive: true, force: true }));

/** A real JPEG, because the thumbnailer is real and has to actually decode it. */
async function writeJpeg(name: string, colour: number): Promise<string> {
  const path = join(work, name);
  const bytes = await sharp({
    create: { width: 640, height: 360, channels: 3, background: { r: colour, g: 90, b: 160 } },
  })
    .jpeg()
    .toBuffer();
  writeFileSync(path, bytes);
  return path;
}

/**
 * A file with a video's name and nothing decodable inside it.
 *
 * That is the point rather than a shortcut: no part of the sidecar decodes video, so a
 * real one would prove nothing this does not, and the thumbnails have to come from the
 * staged frame or from nowhere.
 */
function writeFakeVideo(name: string): string {
  const path = join(work, name);
  writeFileSync(path, Buffer.alloc(2048, 7));
  return path;
}

type UploadMetadata = {
  tags?: number[];
  additionalMetadata?: { Media?: { Width?: number; Height?: number; Duration?: number } };
};

/** Records the thumbnails and the metadata each file was uploaded with. */
function recordingPhotos() {
  const thumbnails: unknown[][] = [];
  const metadata: UploadMetadata[] = [];
  return {
    thumbnails,
    metadata,
    photos: {
      findPhotoDuplicates: async (): Promise<string[]> => [],
      getFileUploader: async (_name: string, meta: UploadMetadata) => {
        metadata.push(meta);
        return {
          uploadFromStream: async (stream: ReadableStream, thumbs: unknown[]) => {
            thumbnails.push(thumbs);
            // Drained the way a real upload drains it, so the file handle closes.
            const reader = stream.getReader();
            while (!(await reader.read()).done) {
              /* discarded */
            }
            return { completion: async () => ({ nodeUid: `uid-${thumbnails.length}` }) };
          },
        };
      },
    },
  };
}

/** Waits for the queue to come to rest, since an upload is fired and not awaited. */
async function settle(): Promise<UploadStatus> {
  for (let tick = 0; tick < 400; tick++) {
    const status = getUploadStatus();
    const done = status.done + status.skipped + status.failed;
    if (status.total > 0 && !status.running && done === status.total) return status;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("the upload never settled");
}

beforeEach(() => clearFinishedUploads());

describe("a path is matched to its frame however it was spelled", () => {
  it("ignores the things Windows itself ignores", () => {
    expect(frameKey("C:\\Users\\a\\Clip.MP4")).toBe(frameKey("c:\\users\\a\\clip.mp4"));
    // A forward slash reaches this from a dialog, a backslash from a drop, and the two
    // name the same file.
    expect(frameKey("C:/Users/a/clip.mp4")).toBe(frameKey("C:\\Users\\a\\clip.mp4"));
  });

  it("does not match two different files", () => {
    expect(frameKey("C:\\a\\one.mp4")).not.toBe(frameKey("C:\\a\\two.mp4"));
    expect(frameKey("C:\\a\\clip.mp4")).not.toBe(frameKey("C:\\b\\clip.mp4"));
  });

  it("gives a group only its own frames", () => {
    const frames = { "C:\\a\\one.mp4": "C:\\t\\f1.jpg", "C:\\b\\two.mp4": "C:\\t\\f2.jpg" };
    const mine = framesForFiles(["C:\\a\\one.mp4", "C:\\a\\photo.jpg"], frames);

    expect(mine.size).toBe(1);
    expect(mine.get(frameKey("C:\\a\\one.mp4"))).toBe("C:\\t\\f1.jpg");
    // A photo never had a frame, and the other group's is not this group's to delete.
    expect(mine.get(frameKey("C:\\a\\photo.jpg"))).toBeUndefined();
    expect([...mine.values()]).not.toContain("C:\\t\\f2.jpg");
  });

  it("survives a drop with no frames at all", () => {
    expect(framesForFiles(["C:\\a\\photo.jpg"], {}).size).toBe(0);
  });
});

describe("thumbnails for an upload", () => {
  it("makes a video's two thumbnails out of the frame the host staged", async () => {
    const video = writeFakeVideo("holiday.mp4");
    const frame = await writeJpeg("holiday-frame.jpg", 20);
    const { photos, thumbnails } = recordingPhotos();

    startUpload(photos, [video], { [video]: frame });
    const status = await settle();

    expect(status.done).toBe(1);
    expect(thumbnails).toHaveLength(1);
    // The defect was that this list was empty for every video ever uploaded.
    expect(thumbnails[0]).toHaveLength(2);
    const [small, preview] = thumbnails[0] as { type: unknown; thumbnail: Uint8Array }[];
    expect(small.type).toBe(ThumbnailType.Type1);
    expect(preview.type).toBe(ThumbnailType.Type2);
    expect(small.thumbnail.byteLength).toBeGreaterThan(0);
    expect(preview.thumbnail.byteLength).toBeGreaterThan(0);
  });

  it("spends the frame, so nothing is left in the temp folder", async () => {
    const video = writeFakeVideo("spent.mp4");
    const frame = await writeJpeg("spent-frame.jpg", 40);
    const { photos } = recordingPhotos();

    startUpload(photos, [video], { [video]: frame });
    await settle();

    expect(existsSync(frame)).toBe(false);
  });

  it("uploads a video with no thumbnails rather than failing when no frame was made", async () => {
    // What a machine with no codec for this container falls back to, and what every
    // video did before the frames existed.
    const video = writeFakeVideo("nocodec.mp4");
    const { photos, thumbnails } = recordingPhotos();

    startUpload(photos, [video], {});
    const status = await settle();

    expect(status.done).toBe(1);
    expect(status.failed).toBe(0);
    expect(thumbnails[0]).toHaveLength(0);
  });

  it("still makes a photo's thumbnails from the photo itself", async () => {
    // The path that already worked, which a frame must never displace.
    const photo = await writeJpeg("sunset.jpg", 200);
    const { photos, thumbnails } = recordingPhotos();

    startUpload(photos, [photo]);
    const status = await settle();

    expect(status.done).toBe(1);
    expect(thumbnails[0]).toHaveLength(2);
  });

  it("handles a mixed drop, each file by its own route", async () => {
    const photo = await writeJpeg("mixed.jpg", 120);
    const video = writeFakeVideo("mixed.mp4");
    const frame = await writeJpeg("mixed-frame.jpg", 60);
    const { photos, thumbnails } = recordingPhotos();

    startUpload(photos, [photo, video], { [video]: frame });
    const status = await settle();

    expect(status.done).toBe(2);
    // Both got a full pair, one decoded from its own bytes and one from the frame.
    expect(thumbnails.every((t) => t.length === 2)).toBe(true);
    expect(existsSync(frame)).toBe(false);
  });

  it("discards a frame for a file that turned out to be a duplicate", async () => {
    const video = writeFakeVideo("dup.mp4");
    const frame = await writeJpeg("dup-frame.jpg", 80);
    const { photos } = recordingPhotos();
    // A duplicate returns before the thumbnailer that would otherwise spend the frame.
    photos.findPhotoDuplicates = async () => ["already-there"];

    startUpload(photos, [video], { [video]: frame });
    const status = await settle();

    expect(status.skipped).toBe(1);
    expect(existsSync(frame)).toBe(false);
  });

  it("discards a frame that sharp could not read, and uploads anyway", async () => {
    const video = writeFakeVideo("broken.mp4");
    // A truncated JPEG: the host writes one only if the encode failed halfway, but the
    // upload is still what was asked for.
    const frame = join(work, "broken-frame.jpg");
    writeFileSync(frame, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]));
    const { photos, thumbnails } = recordingPhotos();

    startUpload(photos, [video], { [video]: frame });
    const status = await settle();

    expect(status.done).toBe(1);
    expect(status.failed).toBe(0);
    expect(thumbnails[0]).toHaveLength(0);
    expect(existsSync(frame)).toBe(false);
  });
});

describe("the tags a file is uploaded with", () => {
  it("marks a video, which is the whole reason this exists", () => {
    // Without this tag the clients that read video-ness off it show an uploaded video as
    // a still photo: no play icon, no length, and no playback.
    expect(photoTagsFor("video/mp4", "holiday.mp4")).toContain(2);
    expect(photoTagsFor("video/quicktime", "clip.mov")).toContain(2);
    expect(photoTagsFor("video/x-matroska", "film.mkv")).toContain(2);
  });

  it("never marks a photo as a video", () => {
    expect(photoTagsFor("image/jpeg", "sunset.jpg")).not.toContain(2);
    expect(photoTagsFor("image/png", "chart.png")).not.toContain(2);
    // A photo named like a video is still a photo: the media type decides.
    expect(photoTagsFor("image/jpeg", "my.mp4.jpg")).not.toContain(2);
  });

  it("marks a raw still by its container", () => {
    expect(photoTagsFor("image/x-adobe-dng", "DSC_0001.dng")).toContain(9);
    expect(photoTagsFor("image/jpeg", "DSC_0001.jpg")).not.toContain(9);
  });

  it("marks a screenshot by the name convention the Android client uses", () => {
    // The same rule on both, so one file classifies alike whichever client sent it.
    expect(photoTagsFor("image/png", "Screenshot 2026-07-19 143022.png")).toContain(1);
    expect(photoTagsFor("image/png", "screen_shot-1.png")).toContain(1);
    expect(photoTagsFor("image/jpeg", "holiday.jpg")).not.toContain(1);
    // A video is never a screenshot, whatever it is called.
    expect(photoTagsFor("video/mp4", "screenshot-recording.mp4")).not.toContain(1);
  });

  it("sends only ids the server accepts", () => {
    // The server rejects any tag id outside 0..9 and refuses the whole upload with it.
    const everything = [
      photoTagsFor("video/mp4", "screenshot.mp4"),
      photoTagsFor("image/x-adobe-dng", "screenshot.dng"),
      photoTagsFor("image/jpeg", "plain.jpg"),
    ].flat();
    for (const tag of everything) {
      expect(Number.isInteger(tag)).toBe(true);
      expect(tag).toBeGreaterThanOrEqual(0);
      expect(tag).toBeLessThanOrEqual(9);
    }
  });

  it("invents nothing it cannot actually determine", () => {
    // An ordinary photo carries no tag at all rather than a guess at one.
    expect(photoTagsFor("image/jpeg", "IMG_4821.jpg")).toEqual([]);
    // A wide photo is not a panorama: that lives in XMP and is not read here.
    expect(photoTagsFor("image/jpeg", "wide-vista.jpg")).toEqual([]);
  });

  it("reaches the uploader, which is where the defect actually was", async () => {
    const video = writeFakeVideo("tagged.mp4");
    const photo = await writeJpeg("untagged.jpg", 30);
    const { photos, metadata } = recordingPhotos();

    startUpload(photos, [photo, video]);
    await settle();

    // The order follows the drop, and a group's files are fired together.
    const byTag = metadata.map((m) => m.tags ?? []);
    expect(byTag.some((tags) => tags.includes(2))).toBe(true);
    expect(byTag.filter((tags) => tags.includes(2))).toHaveLength(1);
  });
});

describe("the dimensions and length a file is uploaded with", () => {
  it("keeps a duration in seconds, the unit Drive stores", () => {
    // Milliseconds here would render every video a thousandth of its length. This
    // project has already paid for that mistake once.
    expect(mediaAttributes({ durationSec: 7.5 })).toEqual({ Media: { Duration: 7.5 } });
    expect(mediaAttributes({ durationSec: 3600 })).toEqual({ Media: { Duration: 3600 } });
  });

  it("says nothing at all rather than sending a zero", () => {
    // A zero reads downstream as a measurement: a video claiming to be no time long.
    expect(mediaAttributes({})).toBeUndefined();
    expect(mediaAttributes({ durationSec: 0 })).toBeUndefined();
    expect(mediaAttributes({ width: 0, height: 0 })).toBeUndefined();
    expect(mediaAttributes({ durationSec: null, width: null, height: null })).toBeUndefined();
  });

  it("refuses half a dimension", () => {
    // One edge is not a size, and storing it would report a shape the file does not have.
    expect(mediaAttributes({ width: 1920 })).toBeUndefined();
    expect(mediaAttributes({ height: 1080 })).toBeUndefined();
    expect(mediaAttributes({ width: 1920, height: 1080 })).toEqual({
      Media: { Width: 1920, Height: 1080 },
    });
  });

  it("carries a video's size and length together", () => {
    expect(mediaAttributes({ width: 3840, height: 2160, durationSec: 12.25 })).toEqual({
      Media: { Width: 3840, Height: 2160, Duration: 12.25 },
    });
  });

  it("reports a turned photo at the size it is displayed", () => {
    // EXIF orientations 5..8 lay the image on its other edge. Storing the unturned pair
    // would report a portrait phone photo as a landscape one.
    expect(displayDimensions(4000, 3000, 1)).toEqual({ width: 4000, height: 3000 });
    expect(displayDimensions(4000, 3000, undefined)).toEqual({ width: 4000, height: 3000 });
    for (const upright of [1, 2, 3, 4]) {
      expect(displayDimensions(4000, 3000, upright)).toEqual({ width: 4000, height: 3000 });
    }
    for (const turned of [5, 6, 7, 8]) {
      expect(displayDimensions(4000, 3000, turned)).toEqual({ width: 3000, height: 4000 });
    }
  });

  it("treats a header it could not read as unknown", () => {
    expect(displayDimensions(undefined, undefined, 1)).toBeNull();
    expect(displayDimensions(4000, undefined, 1)).toBeNull();
    expect(displayDimensions(0, 0, 1)).toBeNull();
    expect(displayDimensions(NaN, 100, 1)).toBeNull();
  });

  it("puts a photo's own dimensions on the upload without asking anyone", async () => {
    // sharp is already opening this file to thumbnail it, so its size costs a header read
    // and never a second source of truth.
    const photo = await writeJpeg("sized.jpg", 150);
    const { photos, metadata } = recordingPhotos();

    startUpload(photos, [photo]);
    await settle();

    expect(metadata[0].additionalMetadata).toEqual({ Media: { Width: 640, Height: 360 } });
  });

  it("takes a video's length and size from what the host asked Windows", async () => {
    // Nothing here decodes video, so this is the only way either value exists.
    const video = writeFakeVideo("described.mp4");
    const { photos, metadata } = recordingPhotos();

    startUpload(photos, [video], {}, { [video]: { width: 1920, height: 1080, durationSec: 42.5 } });
    await settle();

    expect(metadata[0].additionalMetadata).toEqual({
      Media: { Width: 1920, Height: 1080, Duration: 42.5 },
    });
  });

  it("uploads a video the machine could not describe with no attributes at all", async () => {
    // A machine with no codec for this container: the upload is still what was asked for.
    const video = writeFakeVideo("undescribed.mp4");
    const { photos, metadata } = recordingPhotos();

    startUpload(photos, [video]);
    const status = await settle();

    expect(status.done).toBe(1);
    expect(metadata[0].additionalMetadata).toBeUndefined();
  });

  it("never takes a video's dimensions from its staged frame", async () => {
    // The frame is a thumbnail, so its size is the thumbnail's. Reading it here would
    // record a 4K video as whatever Explorer happened to hand back.
    const video = writeFakeVideo("framed.mp4");
    const frame = await writeJpeg("framed-frame.jpg", 90);
    const { photos, metadata, thumbnails } = recordingPhotos();

    startUpload(photos, [video], { [video]: frame });
    await settle();

    // The frame was used for the thumbnails, and for nothing else.
    expect(thumbnails[0]).toHaveLength(2);
    expect(metadata[0].additionalMetadata).toBeUndefined();
  });
});

describe("where and on what a photo was taken", () => {
  it("carries a coordinate through to the Location block", () => {
    expect(mediaAttributes({ latitude: 47.4979, longitude: 19.0402 })).toEqual({
      Location: { Latitude: 47.4979, Longitude: 19.0402 },
    });
  });

  it("keeps a zero coordinate, which is a real place", () => {
    // The guard everywhere else in this function treats 0 as "not measured". A
    // coordinate is the exception: the equator and the prime meridian are somewhere,
    // and dropping them would move those photos off the map entirely.
    expect(mediaAttributes({ latitude: 0, longitude: 0 })).toEqual({
      Location: { Latitude: 0, Longitude: 0 },
    });
  });

  it("takes both halves or neither", () => {
    // Half a coordinate is not a place. Written alone it would put the photo on the
    // equator or the prime meridian rather than nowhere, which is worse than silence.
    expect(mediaAttributes({ latitude: 47.4979 })).toBeUndefined();
    expect(mediaAttributes({ longitude: 19.0402 })).toBeUndefined();
  });

  it("refuses a coordinate that is not on the planet", () => {
    expect(mediaAttributes({ latitude: 91, longitude: 19 })).toBeUndefined();
    expect(mediaAttributes({ latitude: 47, longitude: 181 })).toBeUndefined();
    expect(mediaAttributes({ latitude: NaN, longitude: 19 })).toBeUndefined();
    expect(mediaAttributes({ latitude: Infinity, longitude: 19 })).toBeUndefined();
  });

  it("names the camera", () => {
    expect(mediaAttributes({ device: "Pixel 8" })).toEqual({ Camera: { Device: "Pixel 8" } });
    expect(mediaAttributes({ device: "  " })).toBeUndefined();
  });

  it("does not say the make twice", () => {
    // What Samsung and Google write: the model already opens with the make.
    expect(deviceName("samsung", "samsung SM-S901B")).toBe("samsung SM-S901B");
    expect(deviceName("Google", "Pixel 8")).toBe("Google Pixel 8");
    // What Apple writes, where the two are genuinely separate.
    expect(deviceName("Apple", "iPhone 15")).toBe("Apple iPhone 15");
    // Either half alone, and neither.
    expect(deviceName(undefined, "X100V")).toBe("X100V");
    expect(deviceName("FUJIFILM", undefined)).toBe("FUJIFILM");
    expect(deviceName(undefined, undefined)).toBe("");
  });

  it("puts every block in one set of attributes", () => {
    expect(
      mediaAttributes({
        width: 4000,
        height: 3000,
        durationSec: 12,
        latitude: 47.4979,
        longitude: 19.0402,
        device: "Apple iPhone 15",
      }),
    ).toEqual({
      Media: { Width: 4000, Height: 3000, Duration: 12 },
      Location: { Latitude: 47.4979, Longitude: 19.0402 },
      Camera: { Device: "Apple iPhone 15" },
    });
  });

  it("still says nothing about a file it learned nothing from", () => {
    expect(mediaAttributes({})).toBeUndefined();
  });
});
