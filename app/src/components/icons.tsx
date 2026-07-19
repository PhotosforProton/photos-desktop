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

/**
 * Shared icons, matching the Android app one for one.
 *
 * Every glyph below is the filled Material icon that the Android app draws for the
 * same job, on the same 24x24 viewport, so the two clients read as one product.
 * Filled means weight comes from the shape itself: no stroke to drift out of step
 * between sizes, and `currentColor` fills it.
 *
 * Path geometry: Material Icons by Google, Apache License 2.0. The name above each
 * icon is the Compose symbol the Android side uses.
 *
 * The three photo-type marks are the exception, and say so individually: Android draws
 * Proton Core's own glyphs for those, on a 16x16 viewport, so they are copied across as
 * they are rather than swapped for the nearest Material shape.
 */

type Props = { size?: number };

/** Icons.Filled.Info */
export function InfoIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10 -4.48 10 -10S17.52 2 12 2ZM13 17h-2v-6h2v6ZM13 9h-2L11 7h2v2Z" />
    </svg>
  );
}

/** Icons.Filled.DeleteOutline — the shape Android uses for every destructive action. */
export function TrashIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19c0 1.1 0.9 2 2 2h8c1.1 0 2 -0.9 2 -2L18 7L6 7v12ZM8 9h8v10L8 19L8 9ZM15.5 4l-1 -1h-5l-1 1L5 4v2h14L19 4Z" />
    </svg>
  );
}

/** Icons.Filled.Edit — the thing it sits next to is editable. */
export function PencilIcon({ size = 15 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75 -3.75L3 17.25ZM20.71 7.04c0.39 -0.39 0.39 -1.02 0 -1.41l-2.34 -2.34c-0.39 -0.39 -1.02 -0.39 -1.41 0l-1.83 1.83l3.75 3.75l1.83 -1.83Z" />
    </svg>
  );
}

/** Favorite mark: Icons.Filled.FavoriteBorder when off, Icons.Filled.Favorite once the tag is set. */
export function HeartIcon({ size = 17, filled = false }: Props & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {filled ? (
        <path d="M12 21.35l-1.45 -1.32C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78 -3.4 6.86 -8.55 11.54L12 21.35Z" />
      ) : (
        <path d="M16.5 3c-1.74 0 -3.41 0.81 -4.5 2.09C10.91 3.81 9.24 3 7.5 3C4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45 -1.32C18.6 15.36 22 12.28 22 8.5C22 5.42 19.58 3 16.5 3ZM12.1 18.55l-0.1 0.1l-0.1 -0.1C7.14 14.24 4 11.39 4 8.5C4 6.5 5.5 5 7.5 5c1.54 0 3.04 0.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5c0 2.89 -3.14 5.74 -7.9 10.05Z" />
      )}
    </svg>
  );
}

/** Icons.Filled.Close */
export function CloseIcon({ size = 16 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12Z" />
    </svg>
  );
}

/** Icons.Filled.ViewList: everything the viewer can open, as a list. */
export function ListIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 6h4v4H4V6ZM4 12h4v4H4v-4ZM4 18h4v3H4v-3ZM10 6h10v4H10V6ZM10 12h10v4H10v-4ZM10 18h10v3H10v-3Z" />
    </svg>
  );
}

/** Icons.Filled.ChevronLeft */
export function ChevronLeftIcon({ size = 16 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.41 7.41L14 6l-6 6l6 6l1.41 -1.41L10.83 12Z" />
    </svg>
  );
}

/** Icons.Filled.Settings */
export function GearIcon({ size = 14 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.14 12.94c0.04 -0.3 0.06 -0.61 0.06 -0.94c0 -0.32 -0.02 -0.64 -0.07 -0.94l2.03 -1.58c0.18 -0.14 0.23 -0.41 0.12 -0.61l-1.92 -3.32c-0.12 -0.22 -0.37 -0.29 -0.59 -0.22l-2.39 0.96c-0.5 -0.38 -1.03 -0.7 -1.62 -0.94L14.4 2.81c-0.04 -0.24 -0.24 -0.41 -0.48 -0.41h-3.84c-0.24 0 -0.43 0.17 -0.47 0.41L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33c-0.22 -0.08 -0.47 0 -0.59 0.22L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48l2.03 1.58C4.84 11.36 4.8 11.69 4.8 12s0.02 0.64 0.07 0.94l-2.03 1.58c-0.18 0.14 -0.23 0.41 -0.12 0.61l1.92 3.32c0.12 0.22 0.37 0.29 0.59 0.22l2.39 -0.96c0.5 0.38 1.03 0.7 1.62 0.94l0.36 2.54c0.05 0.24 0.24 0.41 0.48 0.41h3.84c0.24 0 0.44 -0.17 0.47 -0.41l0.36 -2.54c0.59 -0.24 1.13 -0.56 1.62 -0.94l2.39 0.96c0.22 0.08 0.47 0 0.59 -0.22l1.92 -3.32c0.12 -0.22 0.07 -0.47 -0.12 -0.61L19.14 12.94ZM12 15.6c-1.98 0 -3.6 -1.62 -3.6 -3.6s1.62 -3.6 3.6 -3.6s3.6 1.62 3.6 3.6S13.98 15.6 12 15.6Z" />
    </svg>
  );
}

/** Icons.AutoMirrored.Filled.ExitToApp */
export function SignOutIcon({ size = 15 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10.09 15.59L11.5 17l5 -5l-5 -5l-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59ZM19 3H5c-1.11 0 -2 0.9 -2 2v4h2V5h14v14H5v-4H3v4c0 1.1 0.89 2 2 2h14c1.1 0 2 -0.9 2 -2V5c0 -1.1 -0.9 -2 -2 -2Z" />
    </svg>
  );
}

/** Icons.AutoMirrored.Filled.OpenInNew — "open the main window". */
export function OpenWindowIcon({ size = 16 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 19H5V5h7V3H5c-1.11 0 -2 0.9 -2 2v14c0 1.1 0.89 2 2 2h14c1.1 0 2 -0.9 2 -2v-7h-2v7ZM14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3h-7Z" />
    </svg>
  );
}

/** Icons.Filled.Lock — the account is locked until the password is re-entered. */
export function LockIcon({ size = 16 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 8h-1V6c0 -2.76 -2.24 -5 -5 -5S7 3.24 7 6v2H6c-1.1 0 -2 0.9 -2 2v10c0 1.1 0.9 2 2 2h12c1.1 0 2 -0.9 2 -2V10c0 -1.1 -0.9 -2 -2 -2zm-6 9c-1.1 0 -2 -0.9 -2 -2s0.9 -2 2 -2s2 0.9 2 2s-0.9 2 -2 2zm3.1 -9H8.9V6c0 -1.71 1.39 -3.1 3.1 -3.1c1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

/**
 * Icons.Filled.PowerSettingsNew — quit the app. Android has no quit, so there is no
 * counterpart to match; taking it from the same Material set keeps it in step anyway.
 */
export function PowerIcon({ size = 16 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 3h-2v10h2L13 3ZM17.83 5.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87 -3.13 7 -7 7s-7 -3.13 -7 -7c0 -2.19 1.01 -4.14 2.58 -5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9 -4.03 9 -9c0 -2.74 -1.23 -5.18 -3.17 -6.83Z" />
    </svg>
  );
}

/** Icons.Filled.CloudUpload — the one upload mark, wherever uploading is offered. */
export function UploadArrowIcon({ size = 15 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5 -2.24 5 -5c0 -2.64 -2.05 -4.78 -4.65 -4.96ZM14 13v4h-4v-4H7l5 -5l5 5h-3Z" />
    </svg>
  );
}

/** Icons.Filled.FileDownload — the download mark Android uses for the same action. */
export function DownloadIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 9h-4V3H9v6H5l7 7l7 -7ZM5 18v2h14v-2H5Z" />
    </svg>
  );
}

/** Icons.Filled.Cloud — the photo lives in Drive. Green says it is on this device too. */
export function CloudIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5 -2.24 5 -5c0 -2.64 -2.05 -4.78 -4.65 -4.96Z" />
    </svg>
  );
}

/**
 * Icons.Filled.OfflinePin — the app's own copy of the photo, kept for offline use.
 * Deliberately not the cloud: that one marks the File Explorer copy, and the two are
 * different places a photo can be kept.
 */
export function OfflinePinIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22S22 17.52 22 12S17.52 2 12 2ZM17 18H7v-2h10v2ZM10.3 14L7 10.7L8.41 9.29L10.3 11.18L15.6 5.88L17 7.3L10.3 14Z" />
    </svg>
  );
}

/**
 * Icons.Filled.Image — set the selected photo as the album's cover.
 *
 * The four below exist because the selection bar names its actions with a glyph
 * once the labels drop away, and these four had none to drop to. Deleting for good
 * needed its own shape most of all: it shared the plain bin with trashing, and two
 * different endings behind one mark is the one place that must not happen.
 */
export function ImageIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 19V5c0 -1.1 -0.9 -2 -2 -2H5c-1.1 0 -2 0.9 -2 2v14c0 1.1 0.9 2 2 2h14c1.1 0 2 -0.9 2 -2ZM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5 -4.5Z" />
    </svg>
  );
}

/** Icons.Filled.DeleteSweep — give the device copy back, keeping the photo in Drive. */
export function SweepIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15 16h4v2h-4v-2Zm0 -8h7v2h-7V8Zm0 4h6v2h-6v-2ZM3 18c0 1.1 0.9 2 2 2h6c1.1 0 2 -0.9 2 -2V8H3v10ZM14 5h-3l-1 -1H6L5 5H2v2h12V5Z" />
    </svg>
  );
}

/** Icons.Filled.DeleteForever */
export function DeleteForeverIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19c0 1.1 0.9 2 2 2h8c1.1 0 2 -0.9 2 -2V7H6v12Zm2.46 -7.12l1.41 -1.41L12 12.59l2.12 -2.12l1.41 1.41L13.41 14l2.12 2.12l-1.41 1.41L12 15.41l-2.12 2.12l-1.41 -1.41L10.59 14l-2.13 -2.12ZM15.5 4l-1 -1h-5l-1 1H5v2h14V4h-3.5Z" />
    </svg>
  );
}

/** Icons.Filled.MoreHoriz — what did not fit on the row is behind this. */
export function MoreHorizIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 10c-1.1 0 -2 0.9 -2 2s0.9 2 2 2s2 -0.9 2 -2s-0.9 -2 -2 -2Zm12 0c-1.1 0 -2 0.9 -2 2s0.9 2 2 2s2 -0.9 2 -2s-0.9 -2 -2 -2Zm-6 0c-1.1 0 -2 0.9 -2 2s0.9 2 2 2s2 -0.9 2 -2s-0.9 -2 -2 -2Z" />
    </svg>
  );
}

/** Icons.Filled.Check */
export function CheckIcon({ size = 12 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41 -1.41Z" />
    </svg>
  );
}

/** Icons.Filled.Search */
export function SearchIcon({ size = 16 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.5 14h-0.79l-0.28 -0.27C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5S5.91 16 9.5 16c1.61 0 3.09 -0.59 4.23 -1.57l0.27 0.28v0.79l5 4.99L20.49 19l-4.99 -5ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14Z" />
    </svg>
  );
}

/** Icons.Filled.PlayArrow — the video badge on a cell. */
export function PlayArrowIcon({ size = 16 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11 -7Z" />
    </svg>
  );
}

/**
 * The motion-photo mark. Not Material: Android draws Proton Core's own glyph here, so
 * this is that same artwork rather than a lookalike. Its outer ring is a run of dots,
 * which is what gives it the "there is movement in this one" read at badge size.
 *
 * Path geometry: Proton Core icons, Copyright (c) Proton AG, licensed under GPL-3.0.
 */
export function MotionPhotoIcon({ size = 11 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8,0.703C8.197,0.703 8.349,0.551 8.349,0.349C8.349,0.152 8.197,0 8,0C7.803,0 7.646,0.152 7.646,0.349C7.646,0.551 7.803,0.703 8,0.703ZM9.332,0.821C9.529,0.821 9.681,0.669 9.681,0.472C9.681,0.276 9.529,0.118 9.332,0.118C9.136,0.118 8.978,0.276 8.978,0.472C8.978,0.669 9.136,0.821 9.332,0.821ZM10.614,1.164C10.811,1.164 10.968,1.012 10.968,0.815C10.968,0.619 10.811,0.461 10.614,0.461C10.417,0.461 10.266,0.619 10.266,0.815C10.266,1.012 10.417,1.164 10.614,1.164ZM11.828,1.738C12.025,1.738 12.177,1.586 12.177,1.389C12.177,1.192 12.025,1.035 11.828,1.035C11.632,1.035 11.474,1.192 11.474,1.389C11.474,1.586 11.632,1.738 11.828,1.738ZM12.919,2.503C13.116,2.503 13.273,2.345 13.273,2.148C13.273,1.951 13.116,1.8 12.919,1.8C12.722,1.8 12.565,1.951 12.565,2.148C12.565,2.345 12.722,2.503 12.919,2.503ZM13.864,3.442C14.06,3.442 14.218,3.29 14.218,3.093C14.218,2.896 14.06,2.739 13.864,2.739C13.667,2.739 13.515,2.896 13.515,3.093C13.515,3.29 13.667,3.442 13.864,3.442ZM14.628,4.538C14.825,4.538 14.982,4.387 14.982,4.19C14.982,3.993 14.825,3.836 14.628,3.836C14.432,3.836 14.28,3.993 14.28,4.19C14.28,4.387 14.432,4.538 14.628,4.538ZM15.19,5.748C15.387,5.748 15.545,5.59 15.545,5.393C15.545,5.196 15.387,5.045 15.19,5.045C14.994,5.045 14.836,5.196 14.836,5.393C14.836,5.59 14.994,5.748 15.19,5.748ZM15.533,7.03C15.73,7.03 15.887,6.878 15.887,6.676C15.887,6.479 15.73,6.327 15.533,6.327C15.337,6.327 15.179,6.479 15.179,6.676C15.179,6.878 15.337,7.03 15.533,7.03ZM15.646,8.346C15.843,8.346 16,8.194 16,7.997C16,7.8 15.843,7.643 15.646,7.643C15.449,7.643 15.297,7.8 15.297,7.997C15.297,8.194 15.449,8.346 15.646,8.346ZM15.533,9.662C15.73,9.662 15.887,9.51 15.887,9.313C15.887,9.116 15.73,8.959 15.533,8.959C15.337,8.959 15.179,9.116 15.179,9.313C15.179,9.51 15.337,9.662 15.533,9.662ZM15.19,10.95C15.387,10.95 15.545,10.792 15.545,10.595C15.545,10.399 15.387,10.241 15.19,10.241C14.994,10.241 14.836,10.399 14.836,10.595C14.836,10.792 14.994,10.95 15.19,10.95ZM14.628,12.153C14.825,12.153 14.982,12.001 14.982,11.799C14.982,11.602 14.825,11.45 14.628,11.45C14.432,11.45 14.28,11.602 14.28,11.799C14.28,12.001 14.432,12.153 14.628,12.153ZM13.864,13.25C14.06,13.25 14.218,13.098 14.218,12.901C14.218,12.699 14.06,12.547 13.864,12.547C13.667,12.547 13.515,12.699 13.515,12.901C13.515,13.098 13.667,13.25 13.864,13.25ZM12.919,14.195C13.116,14.195 13.273,14.037 13.273,13.84C13.273,13.644 13.116,13.492 12.919,13.492C12.722,13.492 12.565,13.644 12.565,13.84C12.565,14.037 12.722,14.195 12.919,14.195ZM11.828,14.954C12.025,14.954 12.177,14.802 12.177,14.605C12.177,14.408 12.025,14.251 11.828,14.251C11.632,14.251 11.474,14.408 11.474,14.605C11.474,14.802 11.632,14.954 11.828,14.954ZM10.614,15.528C10.811,15.528 10.968,15.376 10.968,15.179C10.968,14.976 10.811,14.825 10.614,14.825C10.417,14.825 10.266,14.976 10.266,15.179C10.266,15.376 10.417,15.528 10.614,15.528ZM9.332,15.871C9.529,15.871 9.681,15.719 9.681,15.522C9.681,15.319 9.529,15.168 9.332,15.168C9.136,15.168 8.978,15.319 8.978,15.522C8.978,15.719 9.136,15.871 9.332,15.871ZM8,15.989C8.197,15.989 8.349,15.837 8.349,15.64C8.349,15.443 8.197,15.286 8,15.286C7.803,15.286 7.646,15.443 7.646,15.64C7.646,15.837 7.803,15.989 8,15.989ZM6.668,15.871C6.864,15.871 7.016,15.719 7.016,15.522C7.016,15.319 6.864,15.168 6.668,15.168C6.471,15.168 6.313,15.319 6.313,15.522C6.313,15.719 6.471,15.871 6.668,15.871ZM5.38,15.528C5.577,15.528 5.734,15.376 5.734,15.179C5.734,14.976 5.577,14.825 5.38,14.825C5.183,14.825 5.032,14.976 5.032,15.179C5.032,15.376 5.183,15.528 5.38,15.528ZM4.171,14.954C4.368,14.954 4.52,14.802 4.52,14.605C4.52,14.408 4.368,14.251 4.171,14.251C3.975,14.251 3.817,14.408 3.817,14.605C3.817,14.802 3.975,14.954 4.171,14.954ZM3.081,14.195C3.278,14.195 3.429,14.037 3.429,13.84C3.429,13.644 3.278,13.492 3.081,13.492C2.884,13.492 2.727,13.644 2.727,13.84C2.727,14.037 2.884,14.195 3.081,14.195ZM2.131,13.25C2.327,13.25 2.485,13.098 2.485,12.901C2.485,12.699 2.327,12.547 2.131,12.547C1.934,12.547 1.782,12.699 1.782,12.901C1.782,13.098 1.934,13.25 2.131,13.25ZM1.366,12.153C1.569,12.153 1.72,12.001 1.72,11.799C1.72,11.602 1.569,11.45 1.366,11.45C1.169,11.45 1.018,11.602 1.018,11.799C1.018,12.001 1.169,12.153 1.366,12.153ZM0.81,10.95C1.006,10.95 1.158,10.792 1.158,10.595C1.158,10.399 1.006,10.241 0.81,10.241C0.613,10.241 0.455,10.399 0.455,10.595C0.455,10.792 0.613,10.95 0.81,10.95ZM0.467,9.662C0.663,9.662 0.815,9.51 0.815,9.313C0.815,9.116 0.663,8.959 0.467,8.959C0.27,8.959 0.112,9.116 0.112,9.313C0.112,9.51 0.27,9.662 0.467,9.662ZM0.354,8.346C0.551,8.346 0.703,8.194 0.703,7.997C0.703,7.8 0.551,7.643 0.354,7.643C0.152,7.643 0,7.8 0,7.997C0,8.194 0.152,8.346 0.354,8.346ZM0.467,7.03C0.663,7.03 0.815,6.878 0.815,6.676C0.815,6.479 0.663,6.327 0.467,6.327C0.27,6.327 0.112,6.479 0.112,6.676C0.112,6.878 0.27,7.03 0.467,7.03ZM0.81,5.748C1.006,5.748 1.158,5.59 1.158,5.393C1.158,5.196 1.006,5.045 0.81,5.045C0.613,5.045 0.455,5.196 0.455,5.393C0.455,5.59 0.613,5.748 0.81,5.748ZM1.366,4.538C1.569,4.538 1.72,4.387 1.72,4.19C1.72,3.993 1.569,3.836 1.366,3.836C1.169,3.836 1.018,3.993 1.018,4.19C1.018,4.387 1.169,4.538 1.366,4.538ZM2.131,3.442C2.327,3.442 2.485,3.29 2.485,3.093C2.485,2.896 2.327,2.739 2.131,2.739C1.934,2.739 1.782,2.896 1.782,3.093C1.782,3.29 1.934,3.442 2.131,3.442ZM3.081,2.503C3.278,2.503 3.429,2.345 3.429,2.148C3.429,1.951 3.278,1.8 3.081,1.8C2.884,1.8 2.727,1.951 2.727,2.148C2.727,2.345 2.884,2.503 3.081,2.503ZM4.171,1.738C4.368,1.738 4.52,1.586 4.52,1.389C4.52,1.192 4.368,1.035 4.171,1.035C3.975,1.035 3.817,1.192 3.817,1.389C3.817,1.586 3.975,1.738 4.171,1.738ZM5.38,1.164C5.577,1.164 5.734,1.012 5.734,0.815C5.734,0.619 5.577,0.461 5.38,0.461C5.183,0.461 5.032,0.619 5.032,0.815C5.032,1.012 5.183,1.164 5.38,1.164ZM6.668,0.821C6.864,0.821 7.016,0.669 7.016,0.472C7.016,0.276 6.864,0.118 6.668,0.118C6.471,0.118 6.313,0.276 6.313,0.472C6.313,0.669 6.471,0.821 6.668,0.821Z" />
      <path d="M8,13.79C11.199,13.79 13.791,11.208 13.791,7.997C13.791,4.808 11.188,2.205 8,2.205C4.779,2.205 2.209,4.792 2.209,7.997C2.209,11.22 4.773,13.79 8,13.79ZM8,13.143C5.127,13.143 2.85,10.865 2.85,7.997C2.85,5.14 5.15,2.846 8,2.846C10.839,2.846 13.15,5.157 13.15,7.997C13.15,10.849 10.85,13.143 8,13.143Z" />
      <path d="M8,10.899C9.602,10.899 10.89,9.611 10.89,8.008C10.89,6.406 9.597,5.112 8,5.112C6.398,5.112 5.105,6.406 5.105,8.008C5.105,9.617 6.392,10.899 8,10.899ZM8,9.701C7.056,9.701 6.308,8.948 6.308,8.008C6.308,7.069 7.061,6.316 8,6.316C8.928,6.316 9.692,7.075 9.692,8.008C9.692,8.942 8.933,9.701 8,9.701Z" />
    </svg>
  );
}

/**
 * The panorama mark — a wide frame curved the way a swept shot is.
 *
 * Path geometry: Proton Core icons, Copyright (c) Proton AG, licensed under GPL-3.0.
 */
export function PanoramaIcon({ size = 11 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M1.717,4.223C1.717,4.223 1.717,4.223 1.718,4.223C1.718,4.223 1.717,4.223 1.717,4.223ZM2,4.337C3.854,5.087 5.88,5.5 8,5.5C10.12,5.5 12.146,5.087 14,4.337V11.663C12.146,10.913 10.12,10.5 8,10.5C5.88,10.5 3.854,10.913 2,11.663V4.337ZM14.283,11.777C14.283,11.777 14.282,11.777 14.282,11.777C14.282,11.777 14.283,11.777 14.283,11.777ZM1.013,3.773C1.004,3.848 1,3.923 1,3.999V11.999C1,12.076 1.004,12.152 1.013,12.227C1.071,12.736 1.658,12.893 2.129,12.692C3.932,11.924 5.917,11.5 8,11.5C10.083,11.5 12.068,11.924 13.871,12.692C14.342,12.893 14.929,12.736 14.987,12.227C14.996,12.152 15,12.076 15,11.999V3.999C15,3.923 14.996,3.848 14.987,3.773C14.93,3.264 14.343,3.107 13.871,3.308C12.068,4.075 10.083,4.5 8,4.5C5.917,4.5 3.932,4.075 2.129,3.308C1.657,3.107 1.07,3.264 1.013,3.773Z" />
    </svg>
  );
}

/**
 * The RAW mark — a page with an R on it, for a photo still carrying sensor data.
 *
 * Path geometry: Proton Core icons, Copyright (c) Proton AG, licensed under GPL-3.0.
 */
export function RawIcon({ size = 11 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M6.887,11.549V9.335H7.463L9.612,11.872C9.79,12.083 10.106,12.109 10.316,11.93C10.527,11.752 10.553,11.436 10.375,11.226L8.671,9.213C8.813,9.172 8.955,9.119 9.092,9.052C9.606,8.799 10.076,8.314 10.076,7.518C10.076,6.726 9.61,6.234 9.102,5.968C8.618,5.715 8.061,5.642 7.693,5.645H6.387C6.111,5.645 5.887,5.869 5.887,6.145V11.549C5.887,11.825 6.111,12.049 6.387,12.049C6.663,12.049 6.887,11.825 6.887,11.549ZM7.7,6.645C7.959,6.642 8.341,6.699 8.639,6.855C8.915,6.999 9.076,7.197 9.076,7.518C9.076,7.836 8.92,8.022 8.65,8.155C8.355,8.3 7.974,8.346 7.715,8.335L7.705,8.335H6.887V6.645L7.695,6.645L7.7,6.645Z" />
      <path fillRule="evenodd" d="M4,1C2.895,1 2,1.895 2,3V13C2,14.105 2.895,15 4,15H12C13.105,15 14,14.105 14,13V5.828C14,5.298 13.789,4.789 13.414,4.414L10.586,1.586C10.211,1.211 9.702,1 9.172,1H4ZM13,13V6H10.5C9.672,6 9,5.328 9,4.5V2H4C3.448,2 3,2.448 3,3V13C3,13.552 3.448,14 4,14H12C12.552,14 13,13.552 13,13ZM10,2.414L12.586,5H10.5C10.224,5 10,4.776 10,4.5V2.414Z" />
    </svg>
  );
}

/** Icons.Filled.FilterList */
export function FilterIcon({ size = 14 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 18h4v-2h-4v2ZM3 6v2h18L21 6L3 6ZM6 13h12v-2L6 11v2Z" />
    </svg>
  );
}

/** Icons.Filled.Refresh */
export function RefreshIcon({ size = 16 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0 -7.99 3.58 -7.99 8s3.57 8 7.99 8c3.73 0 6.84 -2.55 7.73 -6h-2.08c-0.82 2.33 -3.04 4 -5.65 4c-3.31 0 -6 -2.69 -6 -6s2.69 -6 6 -6c1.66 0 3.14 0.69 4.22 1.78L13 11h7V4l-2.35 2.35Z" />
    </svg>
  );
}

/** Icons.Filled.Share */
export function ShareIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 16.08c-0.76 0 -1.44 0.3 -1.96 0.77L8.91 12.7c0.05 -0.23 0.09 -0.46 0.09 -0.7s-0.04 -0.47 -0.09 -0.7l7.05 -4.11c0.54 0.5 1.25 0.81 2.04 0.81c1.66 0 3 -1.34 3 -3s-1.34 -3 -3 -3s-3 1.34 -3 3c0 0.24 0.04 0.47 0.09 0.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0 -3 1.34 -3 3s1.34 3 3 3c0.79 0 1.5 -0.31 2.04 -0.81l7.12 4.16c-0.05 0.21 -0.08 0.43 -0.08 0.65c0 1.61 1.31 2.92 2.92 2.92s2.92 -1.31 2.92 -2.92s-1.31 -2.92 -2.92 -2.92Z" />
    </svg>
  );
}

/**
 * Icons.Filled.LibraryAdd. No Android counterpart: that client puts a photo in an
 * album from a picker screen rather than a menu, so there is no glyph to mirror.
 * The Material symbol for the job keeps it in step with the rest of the set.
 */
export function LibraryAddIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 6H2v14c0 1.1 0.9 2 2 2h14v-2H4V6Zm16 -4H8c-1.1 0 -2 0.9 -2 2v12c0 1.1 0.9 2 2 2h12c1.1 0 2 -0.9 2 -2V4c0 -1.1 -0.9 -2 -2 -2Zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2Z" />
    </svg>
  );
}

/** Icons.Filled.LibraryRemove — the same shape as LibraryAdd, taking away. */
export function LibraryRemoveIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 6H2v14c0 1.1 0.9 2 2 2h14v-2H4V6Zm16 -4H8c-1.1 0 -2 0.9 -2 2v12c0 1.1 0.9 2 2 2h12c1.1 0 2 -0.9 2 -2V4c0 -1.1 -0.9 -2 -2 -2Zm-1 9H9V9h10v2Z" />
    </svg>
  );
}

/** Icons.AutoMirrored.Filled.CallReceived — sharing that points at you. */
export function CallReceivedIcon({ size = 14 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 5.41L18.59 4L7 15.59V9H5v10h10v-2H8.41Z" />
    </svg>
  );
}

/** Icons.AutoMirrored.Filled.CallMade — sharing that points away from you. */
export function CallMadeIcon({ size = 14 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 5v2h6.59L4 18.59L5.41 20L17 8.41V15h2V5Z" />
    </svg>
  );
}

/** Icons.Filled.SwapHoriz — the mark on a pill that turns round when clicked. */
export function SwapHorizIcon({ size = 14 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3ZM21 9l-3.99 -4v3H10v2h7.01v3L21 9Z" />
    </svg>
  );
}

/** Icons.Filled.PersonAdd */
export function PersonAddIcon({ size = 16 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15 12c2.21 0 4 -1.79 4 -4s-1.79 -4 -4 -4s-4 1.79 -4 4s1.79 4 4 4ZM6 10V7H4v3H1v2h3v3h2v-3h3v-2H6ZM15 14c-2.67 0 -8 1.34 -8 4v2h16v-2c0 -2.66 -5.33 -4 -8 -4Z" />
    </svg>
  );
}

/*
 * The video controls, which draw the same marks the Android viewer's control pill
 * does. PlayArrow is above already, shared with the badge a video cell carries.
 */

/** Icons.Filled.Pause */
export function PauseIcon({ size = 18 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19h4V5H6v14ZM14 5v14h4V5h-4Z" />
    </svg>
  );
}

/**
 * Icons.Filled.ChevronRight, the mirror of the left one above. Android steps a paused
 * clip a frame at a time with KeyboardArrowLeft and KeyboardArrowRight, which are this
 * same chevron in the filled set, so the pair here draws both jobs.
 */
export function ChevronRightIcon({ size = 16 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6 -6Z" />
    </svg>
  );
}

/** Icons.AutoMirrored.Filled.VolumeUp */
export function VolumeUpIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 9v6h4l5 5V4L7 9H3ZM16.5 12c0 -1.77 -1.02 -3.29 -2.5 -4.03v8.05c1.48 -0.73 2.5 -2.25 2.5 -4.02ZM14 3.23v2.06c2.89 0.86 5 3.54 5 6.71s-2.11 5.85 -5 6.71v2.06c4.01 -0.91 7 -4.49 7 -8.77s-2.99 -7.86 -7 -8.77Z" />
    </svg>
  );
}

/** Icons.AutoMirrored.Filled.VolumeOff */
export function VolumeOffIcon({ size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 12c0 -1.77 -1.02 -3.29 -2.5 -4.03v2.21l2.45 2.45c0.03 -0.2 0.05 -0.41 0.05 -0.63ZM19 12c0 0.94 -0.2 1.82 -0.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0 -4.28 -2.99 -7.86 -7 -8.77v2.06c2.89 0.86 5 3.54 5 6.71ZM4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-0.67 0.52 -1.42 0.93 -2.25 1.18v2.06c1.38 -0.31 2.63 -0.95 3.69 -1.81L19.73 21L21 19.73L12 10.73L4.27 3ZM12 4L9.91 6.09L12 8.18V4Z" />
    </svg>
  );
}
