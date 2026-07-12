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

/** Proton's photo tags. The server only accepts ids 0..9. */
export const TAG = {
  Favorite: 0,
  Screenshot: 1,
  Video: 2,
  LivePhoto: 3,
  MotionPhoto: 4,
  Selfie: 5,
  Portrait: 6,
  Burst: 7,
  Panorama: 8,
  Raw: 9,
} as const;

export const CATEGORIES: { key: string; label: string; tags: number[] }[] = [
  { key: "fav", label: "Favorites", tags: [TAG.Favorite] },
  { key: "screen", label: "Screenshots", tags: [TAG.Screenshot] },
  { key: "video", label: "Videos", tags: [TAG.Video] },
  { key: "live", label: "Live Photos", tags: [TAG.LivePhoto, TAG.MotionPhoto] },
  { key: "selfie", label: "Selfies", tags: [TAG.Selfie] },
  { key: "portrait", label: "Portraits", tags: [TAG.Portrait] },
  { key: "burst", label: "Bursts", tags: [TAG.Burst] },
  { key: "pano", label: "Panoramas", tags: [TAG.Panorama] },
  { key: "raw", label: "RAW", tags: [TAG.Raw] },
];
