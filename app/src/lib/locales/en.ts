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
  "nav.trash": "Trash",

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
  "tray.locked": "Locked",
  "tray.lockedHint": "Open to unlock",
  "tray.signedOut": "Not signed in",
  "tray.signedOutHint": "Open to sign in",

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
  "settings.general": "General",
  "settings.launchAtLogin": "Start with Windows",
  "settings.launchAtLoginDesc": "Starts in the background when you sign in to Windows, showing only the tray icon until you open it.",
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
    "As new photos are added to your library, download them to the Proton Photos folder automatically.",
  "settings.autoDownloadNeedsExplorer":
    "Works only with \"Proton Photos\" in File Explorer, which is turned off. Download still works: it asks where to save your photos.",
  "settings.restartNeeded": "Restart to apply this change.",
  "settings.restartNow": "Restart now",
  // File types. The "Open with" entries are the app's own to add and take back out;
  // the default handler is not, so that half leads out to Windows rather than
  // pretending to a choice Windows takes from the user alone.
  "settings.fileTypes": "File types",
  "settings.openWith": "Add to the \"Open with\" list",
  "settings.openWithDesc":
    "Lists Photos for Proton in the Windows \"Open with\" menu for JPEG, PNG, GIF, WebP, AVIF, BMP, TIFF and HEIC photos, and for MP4, MOV, M4V and WebM video. Turning this off takes the entries back out.",
  "settings.fileTypesFailed": "Could not change the file types. Please try again.",
  "settings.defaultApp": "Default app for photos and videos",
  "settings.defaultAppDesc":
    "Nothing becomes the default this way: Windows accepts that choice only from you, never from a program. Pick Photos for Proton under Default apps in Windows settings.",
  "settings.defaultAppOpen": "Open Windows settings",
  "settings.defaultAppFailed": "Could not open Windows settings. Please try again.",
  "settings.lockOnHideDesc":
    "When the window is closed to the tray, the app locks and asks for your password the next time you open it.",
  "settings.storage": "Storage",
  // Two different places a photo can be kept on this machine: encrypted inside the
  // app, or downloaded into the Proton Photos folder where Windows can read it. The
  // panel names both rather than adding one number to the other.
  "settings.downloadedCount.one": "{count} photo downloaded",
  "settings.downloadedCount.other": "{count} photos downloaded",
  "settings.downloadedNone": "Nothing downloaded",
  "settings.downloadedDesc":
    "Downloaded photos are ordinary files in the Proton Photos folder, so Windows Search and other programs can read them. Freeing up removes only these local copies, and your photos stay in Proton.",
  "settings.freeUpAll": "Free up {size}",
  "settings.freeUpNothing": "Nothing to free up",
  "settings.freeingUp": "Freeing up…",
  "settings.storageOffline": "Offline photos",
  "settings.storageExplorer": "In File Explorer",
  "settings.offlineCount.one": "{count} photo kept in the app",
  "settings.offlineCount.other": "{count} photos kept in the app",
  "settings.offlineNone": "No photos kept in the app",
  "settings.offlineDesc":
    "Photos you mark as available offline stay encrypted inside the app. They open with no connection, and never appear in the Proton Photos folder, so nothing outside the app can read them.",
  "settings.offlineSaving": "Saving {done}/{total}…",
  "settings.offlineRemoveAll": "Free up {size}",
  "settings.offlineRemoveNothing": "Nothing to free up",
  "settings.offlineRemoving": "Removing…",
  "settings.freeUpFailed": "Could not free up the space. Please try again.",

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
  "photos.offline": "Available offline, encrypted in the app",
  "photos.downloaded": "Downloaded to the Proton Photos folder",
  "photos.renameTitle": "Rename photo",
  "photos.namePlaceholder": "File name",

  // Tile badges
  "badge.motionPhoto": "Motion photo",
  "badge.panorama": "Panorama",
  "badge.raw": "RAW",
  "badge.favorite": "Favorite",

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
  "albums.noneSub": "Create one here, or drop a folder onto the window.",
  "albums.keepDownloaded": "Download this album to the Proton Photos folder",
  "albums.keptDownloaded": "Downloading to the Proton Photos folder (click to stop)",
  "albums.freeUpTitle": "Free up this album's storage?",
  "albums.freeUpCount.one":
    "The album has stopped downloading itself. {count} photo is already in the Proton Photos folder and can stay, or you can free up the space it takes. It stays in Proton either way.",
  "albums.freeUpCount.other":
    "The album has stopped downloading itself. {count} photos are already in the Proton Photos folder and can stay, or you can free up the space they take. They stay in Proton either way.",
  "albums.freeUpKeep": "Keep downloaded",
  "albums.freeUpConfirm": "Free up",
  "albums.newAlbum": "New album",
  "albums.newTitle": "Name the album",
  "albums.namePlaceholder": "Album name",
  "albums.create": "Create",
  "albums.createAndAdd": "Create and add",
  "albums.rename": "Rename",
  "albums.renameTitle": "Rename album",
  "albums.share": "Share album",
  "albums.delete": "Delete album",
  "albums.deleted": "Album deleted",
  "albums.addTitle": "Add to album",
  "albums.addCount.one": "Choose where to put {count} photo.",
  "albums.addCount.other": "Choose where to put {count} photos.",
  "albums.added": "{count} added",
  "albums.addPartial": "{ok} added, {failed} failed",
  "albums.removed": "{count} removed from the album",
  "albums.removePartial": "{ok} removed, {failed} failed",
  "albums.coverSet": "Cover updated",
  "albums.strandedTitle.one": "{count} photo is only in this album",
  "albums.strandedTitle.other": "{count} photos are only in this album",
  "albums.strandedMsg.one":
    "It is not in your timeline, so deleting the album deletes it too. Save it to your timeline to keep it.",
  "albums.strandedMsg.other":
    "They are not in your timeline, so deleting the album deletes them too. Save them to your timeline to keep them.",
  "albums.savePhotos": "Save to timeline",
  "albums.deletePhotosToo": "Delete photos too",

  // Shared
  "shared.byMe": "Shared by me",
  "shared.withMe": "Shared with me",
  "shared.flip": "Switch between shared by me and shared with me",
  "shared.emptyByTitle": "You are not sharing anything",
  "shared.emptyWithTitle": "Nothing shared with you",
  "shared.emptyBySub": "Photos and albums you share will appear here.",
  "shared.emptyWithSub": "Photos and albums others share with you will appear here.",
  "shared.publicLink": "Shared via public link",
  "shared.album": "Album",
  "shared.manage": "Manage sharing",
  "shared.back": "Back to shared",

  // Share dialog. A public link's URL carries the secret that decrypts what it
  // points at, so copying it whole is the whole point of the link section. A
  // link's password is never read back, so the dialog reports whether one is set
  // rather than showing it.
  "share.title": "Share",
  "share.linkTitle": "Public link",
  "share.linkDesc": "Anyone with the link can open this photo.",
  "share.createLink": "Create link",
  "share.copyLink": "Copy link",
  "share.copied": "Copied",
  "share.removeLink": "Remove link",
  "share.passwordLabel": "Password",
  "share.passwordSet": "Required to open",
  "share.passwordNone": "Not set",
  "share.passwordPlaceholder": "New password",
  "share.expiryLabel": "Expires",
  "share.expiryNever": "Never",
  "share.expiryPast": "Pick a date in the future.",
  "share.add": "Add",
  "share.change": "Change",
  "share.set": "Set",
  "share.save": "Save",
  "share.albumInviteOnly": "Albums are shared by invitation, not by a public link.",
  "share.peopleTitle": "People",
  "share.emailPlaceholder": "Email address",
  "share.invite": "Invite",
  "share.roleViewer": "Viewer",
  "share.roleEditor": "Editor",
  "share.stateInvited": "Invited",
  "share.stateExternal": "Invited (no Proton account)",
  "share.remove": "Remove",
  "share.noPeople": "No one yet",
  "share.stopSharing": "Stop sharing",
  "share.notOwned": "This was shared with you. Only its owner can change who has access.",
  "share.badEmail": "That does not look like an email address.",
  "share.copyFailed": "Could not copy the link",
  "share.failed": "Could not update sharing",
  "share.working": "Working…",

  // Trash
  "trash.emptyTitle": "Trash is empty",
  "trash.emptySub": "Photos you move to the trash appear here, and can be put back.",
  "trash.emptyAction": "Empty trash",
  "trash.moved": "{count} moved to the trash",
  "trash.movedPartial": "{ok} moved to the trash, {failed} failed",
  "trash.restored": "{count} restored",
  "trash.deleted": "{count} deleted forever",
  "trash.emptied": "Trash emptied",
  "trash.partial": "{ok} done, {failed} failed",

  // Photo viewer / lightbox
  "viewer.details": "Details",
  "viewer.offlineAdd": "Keep an offline copy, encrypted in the app",
  "viewer.offlineRemove": "Remove offline copy",
  "viewer.download": "Download to the Proton Photos folder",
  "viewer.saveToFolder": "Save a copy where you choose",
  "viewer.freeUp": "Remove the local copy to free up space",
  "viewer.detailsShortcut": "Details (I)",
  "viewer.contents": "Contents",
  "viewer.contentsShortcut": "Contents (L)",
  "viewer.filmstrip": "Nearby items",
  "viewer.position": "{n} of {total}",
  "viewer.favoriteShortcut": "Add to favorites (F)",
  "viewer.unfavoriteShortcut": "Remove from favorites (F)",
  "viewer.trashShortcut": "Move to trash (Del)",
  "viewer.shareShortcut": "Share (S)",
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
  "viewer.onServer": "Storage used",
  "viewer.albums": "Albums",
  "viewer.shared": "Shared",
  "viewer.sharedPublic": "Public link",
  "viewer.sharedPeople": "With people",
  "viewer.sharedNo": "No",
  "viewer.unverified": " (unverified)",
  "viewer.trashFailed": "This photo could not be moved to the trash.",
  "viewer.favoriteFailed": "Favorites could not be updated.",
  "viewer.downloadFailed": "This photo could not be downloaded.",
  "viewer.zoomOut": "Zoom out",
  "viewer.zoomIn": "Zoom in",
  "viewer.resetFit": "Reset to fit",
  "viewer.videoLoading": "Loading video…",
  "viewer.videoError":
    "This video format cannot be played here. Download it to watch in another player.",
  "viewer.videoTooLarge":
    "This video is too large to play here. Download it to watch in another player.",

  // The viewer's own video controls, which stand in for the browser's.
  "viewer.videoPlay": "Play (Space)",
  "viewer.videoPause": "Pause (Space)",
  "viewer.videoStepBack": "Previous frame",
  "viewer.videoStepForward": "Next frame",
  "viewer.videoSeek": "Playback position",
  "viewer.videoMute": "Mute",
  "viewer.videoUnmute": "Unmute",

  // Local file viewer: a file opened from File Explorer, which the app can show
  // with nobody signed in. Everything both viewers say alike comes from above.
  "local.camera": "Camera",
  "local.created": "Created",
  "local.path": "Location",
  "local.upload": "Upload to Proton",
  "local.uploadUnsupported": "Proton does not accept this file type",
  "local.uploading": "Uploading…",
  "local.uploaded": "Saved to Proton",
  "local.uploadSkipped": "Already saved",
  "local.uploadFailed": "Upload failed. Try again.",
  "local.delete": "Delete",
  "local.deleteTitle": "Delete this file?",
  "local.deleteMessage": "“{name}” will be moved to the recycle bin.",
  "local.notFound": "This file has been moved or deleted.",
  "local.unreadable":
    "This file could not be read. It may be open in another program, or out of reach of this account.",
  "local.openFailed": "This file could not be opened.",
  "local.decodeFailed": "This photo could not be read. The file may be damaged or incomplete.",
  "local.videoUnsupported":
    "This video format cannot be played here. Open it in another player to watch it.",
  "local.noCodec":
    "Windows has no decoder for this format, so it cannot be shown here. The Microsoft Store carries what is missing for some of them: the HEIF and HEVC extensions for HEIC photos, and the Raw Image Extension for camera raw files.",
  "local.signInTitle": "Sign in to upload",
  "local.signInBody": "The app window opens so you can sign in. This file stays open here.",
  "local.signInAction": "Sign in",

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
  "selection.restore": "Restore",
  "selection.deleteForever": "Delete forever",
  "selection.more": "More",
  "selection.download": "Download",
  "selection.freeUp": "Free up",
  "selection.addToAlbum": "Add to album",
  "selection.removeFromAlbum": "Remove from album",
  "selection.setCover": "Set as cover",
  "selection.rename": "Rename",
  "selection.share": "Share",
  "selection.favorite": "Add to favorites",
  "selection.unfavorite": "Remove from favorites",
  "selection.offlineAdd": "Available offline",
  "selection.offlineRemove": "Remove offline copy",
  // Download: the copy that lands in the Proton Photos folder, where Windows and any
  // other program can read it. Never called offline, which is the app's own copy.
  "download.freedUp": "{count} freed up",
  "download.freedUpNone": "Nothing was freed up",
  "download.notDownloaded": "Nothing downloaded to free up",
  "download.running": "Downloading…",
  "download.progress": "Downloading {done}/{total}…",
  "download.done": "{count} downloaded to the Proton Photos folder",
  "download.donePartial": "{ok} of {total} downloaded",
  "download.doneNone": "Nothing was downloaded. The Proton Photos folder may not be ready yet.",
  "download.alreadyDownloaded": "Already downloaded",
  "download.saved": "{count} saved to the folder",
  "download.partial": "Saved {ok}, {failed} failed",

  // Available offline: the app's own encrypted copy, which is not the Proton Photos
  // folder. These say where the copy went, so the two are never mistaken for one another.
  "offline.added.one": "{count} photo is being saved for offline use",
  "offline.added.other": "{count} photos are being saved for offline use",
  "offline.removed.one": "{count} offline copy removed",
  "offline.removed.other": "{count} offline copies removed",
  "offline.alreadyOffline": "Already available offline",
  "offline.noneOffline": "No offline copies to remove",
  "offline.failed": "could not save for offline use",

  // Trash confirmation
  "confirm.trashTitle": "Move to trash?",
  "confirm.trashConfirm": "Move to trash",
  "confirm.trashCount.one":
    "{count} photo will be moved to the trash. You can restore it from the Trash tab.",
  "confirm.trashCount.other":
    "{count} photos will be moved to the trash. You can restore them from the Trash tab.",
  "confirm.trashName":
    '"{name}" will be moved to the trash. You can restore it from the Trash tab.',
  "confirm.thisPhoto": "This photo",

  // Remove from album. The photos stay in Photos; only the album loses them.
  "confirm.removeTitle": "Remove from album?",
  "confirm.removeConfirm": "Remove",
  "confirm.removeCount.one":
    "{count} photo will be taken out of this album and kept in your timeline.",
  "confirm.removeCount.other":
    "{count} photos will be taken out of this album and kept in your timeline.",

  // Delete-forever confirmation. Nothing in the app or at Proton undoes these.
  "confirm.deleteTitle": "Delete forever?",
  "confirm.deleteConfirm": "Delete forever",
  "confirm.deleteCount.one":
    "{count} photo will be permanently deleted from Proton. This cannot be undone.",
  "confirm.deleteCount.other":
    "{count} photos will be permanently deleted from Proton. This cannot be undone.",
  "confirm.emptyTitle": "Empty the trash?",
  "confirm.emptyConfirm": "Delete everything",
  "confirm.emptyMessage":
    "Everything in the trash will be permanently deleted from Proton. This cannot be undone.",

  // Deleting an album skips the trash, so the album is gone for good even though
  // the photos in your timeline are not.
  "confirm.deleteAlbumTitle": "Delete this album?",
  "confirm.deleteAlbumMessage":
    "The album will be deleted and cannot be restored. Photos in your timeline are kept.",

  // Revoking sharing takes access away from people who may already hold the link,
  // and nothing is deleted by it, so both of these say exactly what is lost.
  "confirm.removeLinkTitle": "Remove the link?",
  "confirm.removeLinkMessage":
    "The link stops working for everyone who has it. People invited by email keep their access.",
  "confirm.removeLinkConfirm": "Remove link",
  "confirm.replaceLinkTitle": "Replace the link?",
  "confirm.replaceLinkMessage":
    "This link is too old to be changed, so saving replaces it with a new one at a different address. The old link stops working for everyone who has it, and its password is cleared. The new link goes to your clipboard.",
  "confirm.replaceLinkConfirm": "Replace link",
  "confirm.stopSharingTitle": "Stop sharing?",
  "confirm.stopSharingMessage":
    "The link stops working and everyone invited loses access. Nothing is deleted.",
  "confirm.stopSharingConfirm": "Stop sharing",

  // Freeing up drops the downloaded copies only. Nothing leaves Proton, so this asks
  // before a big change without treating it as one there is no way back from.
  "confirm.freeUpAllTitle": "Free up all downloaded photos?",
  "confirm.freeUpAllMessage":
    "The {size} in the Proton Photos folder will be removed. Your photos stay in Proton, and download again whenever you open them.",
  "confirm.freeUpAllConfirm": "Free up",

  // Removing every offline copy. The photos themselves are untouched, so this warns
  // about the download they will need next time and nothing more.
  "confirm.removeOfflineAllTitle": "Remove all offline copies?",
  "confirm.removeOfflineAllMessage":
    "The {size} kept encrypted in the app will be removed. Your photos stay in Proton, and these will need a connection to open again.",
  "confirm.removeOfflineAllConfirm": "Remove",
};
