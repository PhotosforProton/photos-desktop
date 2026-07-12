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

// English strings. This is the source of truth: every other locale mirrors these
// keys exactly, and any key missing elsewhere falls back to the value here.
export const en: Record<string, string> = {
  // Common
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.back": "Back",
  "common.loading": "Loading…",
  "common.photoCount.one": "{count} photo",
  "common.photoCount.other": "{count} photos",

  // Navigation
  "nav.photos": "Photos",
  "nav.albums": "Albums",
  "nav.shared": "Shared",

  // App shell
  "app.restoring": "Restoring session…",
  "update.available": "Update {version} is available",
  "update.now": "Update",
  "update.updating": "Updating…",
  "update.failed": "Update failed",
  "update.hashError": "Download failed verification",
  "menu.reload": "Reload",
  "menu.moreSoon": "More soon…",
  "menu.quit": "Quit",

  // Tray popup
  "tray.open": "Open Photos for Proton",
  "tray.syncNow": "Sync now",
  "tray.syncing": "Syncing…",
  "tray.synced": "Up to date",

  // Login
  "login.subtitle": "Sign in to your Proton account",
  "login.emailLabel": "Email or username",
  "login.passwordLabel": "Password",
  "login.passwordPlaceholder": "Password",
  "login.signIn": "Sign in",
  "login.signingIn": "Signing in…",
  "login.twofaLabel": "Two-factor code",
  "login.verify": "Verify",
  "login.verifying": "Verifying…",
  "login.captchaHint": "Proton asks you to confirm you are human.",
  "login.captchaExpired": "The captcha expired. Please solve it again.",

  // Lock screen (returning cold start)
  "lock.subtitle": "Enter your password to unlock",
  "lock.unlock": "Unlock",
  "lock.unlocking": "Unlocking…",
  "lock.wrongPassword": "Wrong password",
  "lock.failed": "Could not unlock. Please try again.",
  "lock.differentAccount": "Use a different account",

  // Titlebar
  "titlebar.minimize": "Minimize",
  "titlebar.maximize": "Maximize",

  // Settings
  "settings.title": "Settings",
  "settings.appearance": "Appearance",
  "settings.theme": "Theme",
  "settings.themeDesc": "System follows Windows and keeps following it as it changes.",
  "settings.theme.dark": "Dark",
  "settings.theme.light": "Light",
  "settings.theme.system": "System",
  "settings.palette": "Palette",
  "settings.paletteDesc": "Accent color used across the app.",
  "settings.palette.default": "Default",
  "settings.palette.forest": "Forest",
  "settings.palette.sunset": "Sunset",
  "settings.palette.sea": "Sea",
  "settings.palette.sepia": "Sepia",
  "settings.palette.mono": "Mono",
  "settings.palette.amoled": "Pure black (AMOLED)",
  "settings.language": "Language",
  "settings.languageDesc": "Choose the display language.",
  "settings.timeline": "Timeline",
  "settings.hideAlbum": "Hide photos in Drive albums",
  "settings.hideAlbumDesc":
    "Photos added to a Drive album will not appear in your main timeline. They still show in the Albums and Shared tabs, and in the category filters.",
  "settings.security": "Security",
  "settings.lockOnHide": "Require password when reopening from the tray",
  "settings.debug": "Debug overlay",
  "settings.debugDesc": "Show a live memory HUD (heap and cache sizes).",
  "settings.explorer": "File Explorer",
  "settings.showInExplorer": "Show \"Proton Photos\" in File Explorer",
  "settings.showInExplorerDesc":
    "Adds a Proton Photos entry to the Explorer sidebar with your cloud photos. Takes effect after a restart.",
  "settings.autoDownload": "Automatically download new photos",
  "settings.autoDownloadDesc":
    "As new photos are added to your library, keep a copy on this device automatically.",
  "settings.restartNeeded": "Restart to apply this change.",
  "settings.restartNow": "Restart now",
  "settings.lockOnHideDesc":
    "When the window is closed to the tray, the app locks and asks for your password the next time you open it.",

  // Profile menu
  "profile.storage": "Storage",
  "profile.used": "{size} used",
  "profile.total": "{size} total",
  "profile.signOut": "Sign out",

  // Avatar
  "avatar.uploading": "Uploading",
  "avatar.syncing": "Syncing",
  "avatar.account": "Account and settings",
  "avatar.showUploads": "Show uploads",

  // Photos view
  "photos.all": "All",
  "photos.search": "Search",
  "photos.searchPlaceholder": "Search by file name or type…",
  "photos.closeSearch": "Close search",
  "photos.smaller": "Smaller",
  "photos.bigger": "Bigger",
  "photos.indexing": "Indexing {done}/{total}",
  "photos.uploadTitle": "Upload photos, or a folder as an album",
  "photos.uploadingProgress": "Uploading {progress}",
  "photos.noMatches": "No matches",
  "photos.noPhotos": "No photos yet",
  "photos.noPhotosSub": "Your photos will appear here once synced.",
  "photos.stillIndexing": "Still indexing, more results will appear.",
  "photos.loadingThumbnails": "Loading thumbnails…",
  "photos.dropTitle": "Drop to upload",
  "photos.dropSub": "A folder becomes an album with the same name",
  "photos.offline": "Available offline",

  // Search type filters
  "filter.images": "Images",
  "filter.videos": "Videos",

  // Filter panel
  "filter.title": "Filter",
  "filter.categories": "Categories",
  "filter.type": "Type",
  "filter.mediaAll": "All",
  "filter.mediaPhotos": "Photos",
  "filter.reset": "Reset",

  // Categories
  "category.fav": "Favorites",
  "category.screen": "Screenshots",
  "category.video": "Videos",
  "category.live": "Live Photos",
  "category.selfie": "Selfies",
  "category.portrait": "Portraits",
  "category.burst": "Bursts",
  "category.pano": "Panoramas",
  "category.raw": "RAW",

  // Albums
  "albums.backToAlbums": "Back to albums",
  "albums.untitled": "Untitled album",
  "albums.empty": "This album is empty",
  "albums.none": "No albums yet",
  "albums.noneSub": "Drop a folder onto the window to create one.",
  "albums.keepOffline": "Keep this album on this device",
  "albums.keptOffline": "Kept on this device (click to stop)",

  // Shared
  "shared.byMe": "Shared by me",
  "shared.withMe": "Shared with me",
  "shared.emptyByTitle": "You are not sharing anything",
  "shared.emptyWithTitle": "Nothing shared with you",
  "shared.emptyBySub": "Photos and albums you share will appear here.",
  "shared.emptyWithSub": "Photos and albums others share with you will appear here.",
  "shared.publicLink": "Shared via public link",
  "shared.album": "Album",

  // Photo viewer / lightbox
  "viewer.details": "Details",
  "viewer.download": "Keep offline",
  "viewer.freeUp": "Free up space",
  "viewer.detailsShortcut": "Details (I)",
  "viewer.trashShortcut": "Move to trash (Del)",
  "viewer.rename": "Click to rename",
  "viewer.closeShortcut": "Close (Esc)",
  "viewer.prev": "Previous (←)",
  "viewer.next": "Next (→)",
  "viewer.name": "Name",
  "viewer.type": "Type",
  "viewer.dimensions": "Dimensions",
  "viewer.taken": "Taken",
  "viewer.added": "Added",
  "viewer.modified": "Modified",
  "viewer.size": "Size",
  "viewer.onServer": "On server",
  "viewer.albums": "Albums",
  "viewer.shared": "Shared",
  "viewer.sharedPublic": "Public link",
  "viewer.sharedPeople": "With people",
  "viewer.sharedNo": "No",
  "viewer.unverified": " (unverified)",
  "viewer.trashFailed": "could not move to trash",
  "viewer.zoomOut": "Zoom out",
  "viewer.zoomIn": "Zoom in",
  "viewer.resetFit": "Reset to fit",
  "viewer.videoLoading": "Loading video…",
  "viewer.videoError": "This video format can't be played here. Download it to watch.",
  "viewer.videoTooLarge": "This video is too large to play here. Download it to watch.",

  // Upload panel
  "upload.title": "Upload",
  "upload.filterName": "Photos and videos",
  "upload.dropHint": "Drop photos or a folder anywhere on the window",
  "upload.dropSub":
    "Photos go straight to your timeline. A folder becomes an album with the same name.",
  "upload.chooseFiles": "Choose files",
  "upload.chooseFolder": "Choose folder",
  "upload.alreadyThere": "{count} already there",
  "upload.failedCount": "{count} failed",
  "upload.clear": "Clear",
  "upload.statusUploading": "uploading…",
  "upload.statusSkipped": "skipped",
  "upload.statusQueued": "queued",
  "upload.statusFailed": "failed",

  // Grid tile
  "grid.select": "Select",
  "grid.deselect": "Deselect",

  // Selection bar
  "selection.cancel": "Cancel selection (Esc)",
  "selection.count.one": "{count} photo selected",
  "selection.count.other": "{count} photos selected",
  "selection.trash": "Trash",
  "selection.download": "Download",
  "selection.freeUp": "Free up",
  "download.freedUp": "{count} freed up",
  "download.notDownloaded": "Nothing downloaded to free up",
  "download.running": "Downloading…",
  "download.done": "{count} kept offline",
  "download.alreadyOffline": "Already available offline",
  "download.partial": "Saved {ok}, {failed} failed",

  // Trash confirmation
  "confirm.trashTitle": "Move to trash?",
  "confirm.trashConfirm": "Move to trash",
  "confirm.trashCount.one":
    "{count} photo will be moved to the trash. You can restore them from Proton Drive.",
  "confirm.trashCount.other":
    "{count} photos will be moved to the trash. You can restore them from Proton Drive.",
  "confirm.trashName":
    '"{name}" will be moved to the trash. You can restore it from Proton Drive.',
  "confirm.thisPhoto": "This photo",
};
