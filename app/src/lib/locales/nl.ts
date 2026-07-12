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

// Dutch (nl) strings. Keys mirror en.ts exactly.
export const nl: Record<string, string> = {
  // Common
  "common.cancel": "Annuleren",
  "common.close": "Sluiten",
  "common.back": "Terug",
  "common.loading": "Laden…",
  "common.photoCount.one": "{count} foto",
  "common.photoCount.other": "{count} foto's",

  // Navigation
  "nav.photos": "Foto's",
  "nav.albums": "Albums",
  "nav.shared": "Gedeeld",

  // App shell
  "app.restoring": "Sessie herstellen…",
  "update.available": "Update {version} is beschikbaar",
  "update.now": "Bijwerken",
  "update.updating": "Bijwerken…",
  "update.failed": "Bijwerken mislukt",
  "update.hashError": "Downloadverificatie mislukt",
  "menu.reload": "Opnieuw laden",
  "menu.moreSoon": "Binnenkort meer…",
  "menu.quit": "Afsluiten",

  // Tray popup
  "tray.open": "Photos for Proton openen",
  "tray.syncNow": "Nu synchroniseren",
  "tray.syncing": "Synchroniseren…",
  "tray.synced": "Gesynchroniseerd",

  // Login
  "login.subtitle": "Meld je aan bij je Proton-account",
  "login.emailLabel": "E-mail of gebruikersnaam",
  "login.passwordLabel": "Wachtwoord",
  "login.passwordPlaceholder": "Wachtwoord",
  "login.signIn": "Aanmelden",
  "login.signingIn": "Aanmelden…",
  "login.twofaLabel": "Tweefactorcode",
  "login.verify": "Verifiëren",
  "login.verifying": "Verifiëren…",
  "login.captchaHint": "Proton vraagt je te bevestigen dat je een mens bent.",
  "login.captchaExpired": "De captcha is verlopen. Los hem opnieuw op.",

  // Lock screen (returning cold start)
  "lock.subtitle": "Voer je wachtwoord in om te ontgrendelen",
  "lock.unlock": "Ontgrendelen",
  "lock.unlocking": "Ontgrendelen…",
  "lock.wrongPassword": "Onjuist wachtwoord",
  "lock.failed": "Ontgrendelen mislukt. Probeer het opnieuw.",
  "lock.differentAccount": "Een ander account gebruiken",

  // Titlebar
  "titlebar.minimize": "Minimaliseren",
  "titlebar.maximize": "Maximaliseren",

  // Settings
  "settings.title": "Instellingen",
  "settings.appearance": "Weergave",
  "settings.theme": "Thema",
  "settings.themeDesc": "Systeem volgt Windows en blijft meebewegen wanneer dat verandert.",
  "settings.theme.dark": "Donker",
  "settings.theme.light": "Licht",
  "settings.theme.system": "Systeem",
  "settings.palette": "Palet",
  "settings.paletteDesc": "Accentkleur die in de hele app wordt gebruikt.",
  "settings.palette.default": "Standaard",
  "settings.palette.forest": "Bos",
  "settings.palette.sunset": "Zonsondergang",
  "settings.palette.sea": "Zee",
  "settings.palette.sepia": "Sepia",
  "settings.palette.mono": "Mono",
  "settings.palette.amoled": "Puur zwart (AMOLED)",
  "settings.language": "Taal",
  "settings.languageDesc": "Kies de weergavetaal.",
  "settings.timeline": "Tijdlijn",
  "settings.hideAlbum": "Foto's in Drive-albums verbergen",
  "settings.hideAlbumDesc":
    "Foto's die aan een Drive-album zijn toegevoegd, verschijnen niet in je hoofdtijdlijn. Ze blijven zichtbaar in de tabbladen Albums en Gedeeld, en in de categoriefilters.",
  "settings.security": "Beveiliging",
  "settings.lockOnHide": "Wachtwoord vereisen bij heropenen vanuit het systeemvak",
  "settings.debug": "Debug-overlay",
  "settings.debugDesc": "Toon een live geheugen-HUD (heap- en cachegrootte).",
  "settings.explorer": "Verkenner",
  "settings.showInExplorer": '"Proton Photos" tonen in Verkenner',
  "settings.showInExplorerDesc":
    "Voegt een Proton Photos-item met je cloudfoto's toe aan de zijbalk van Verkenner. Werkt na een herstart.",
  "settings.autoDownload": "Nieuwe foto's automatisch downloaden",
  "settings.autoDownloadDesc":
    "Bewaar automatisch een kopie op dit apparaat zodra er nieuwe foto's aan je bibliotheek worden toegevoegd.",
  "settings.restartNeeded": "Herstart om deze wijziging toe te passen.",
  "settings.restartNow": "Nu herstarten",
  "settings.lockOnHideDesc":
    "Wanneer het venster naar het systeemvak wordt gesloten, vergrendelt de app en vraagt hij bij de volgende keer openen om je wachtwoord.",

  // Profile menu
  "profile.storage": "Opslag",
  "profile.used": "{size} gebruikt",
  "profile.total": "{size} totaal",
  "profile.signOut": "Afmelden",

  // Avatar
  "avatar.uploading": "Uploaden",
  "avatar.syncing": "Synchroniseren",
  "avatar.account": "Account en instellingen",
  "avatar.showUploads": "Uploads tonen",

  // Photos view
  "photos.all": "Alle",
  "photos.search": "Zoeken",
  "photos.searchPlaceholder": "Zoeken op bestandsnaam of type…",
  "photos.closeSearch": "Zoeken sluiten",
  "photos.smaller": "Kleiner",
  "photos.bigger": "Groter",
  "photos.indexing": "Indexeren {done}/{total}",
  "photos.uploadTitle": "Foto's uploaden, of een map als album",
  "photos.uploadingProgress": "Uploaden {progress}",
  "photos.noMatches": "Geen overeenkomsten",
  "photos.noPhotos": "Nog geen foto's",
  "photos.noPhotosSub": "Je foto's verschijnen hier zodra ze gesynchroniseerd zijn.",
  "photos.stillIndexing": "Nog aan het indexeren, er verschijnen meer resultaten.",
  "photos.loadingThumbnails": "Miniaturen laden…",
  "photos.dropTitle": "Sleep hierheen om te uploaden",
  "photos.dropSub": "Een map wordt een album met dezelfde naam",
  "photos.offline": "Offline beschikbaar",

  // Search type filters
  "filter.images": "Afbeeldingen",
  "filter.videos": "Video's",

  // Filter panel
  "filter.title": "Filter",
  "filter.categories": "Categorieën",
  "filter.type": "Type",
  "filter.mediaAll": "Alle",
  "filter.mediaPhotos": "Foto's",
  "filter.reset": "Herstellen",

  // Categories
  "category.fav": "Favorieten",
  "category.screen": "Screenshots",
  "category.video": "Video's",
  "category.live": "Live-foto's",
  "category.selfie": "Selfies",
  "category.portrait": "Portretten",
  "category.burst": "Burst-opnamen",
  "category.pano": "Panorama's",
  "category.raw": "RAW",

  // Albums
  "albums.backToAlbums": "Terug naar albums",
  "albums.untitled": "Naamloos album",
  "albums.empty": "Dit album is leeg",
  "albums.none": "Nog geen albums",
  "albums.noneSub": "Sleep een map op het venster om er een te maken.",
  "albums.keepOffline": "Dit album op dit apparaat bewaren",
  "albums.keptOffline": "Bewaard op dit apparaat (klik om te stoppen)",

  // Shared
  "shared.byMe": "Door mij gedeeld",
  "shared.withMe": "Met mij gedeeld",
  "shared.emptyByTitle": "Je deelt niets",
  "shared.emptyWithTitle": "Niets met je gedeeld",
  "shared.emptyBySub": "Foto's en albums die je deelt, verschijnen hier.",
  "shared.emptyWithSub": "Foto's en albums die anderen met je delen, verschijnen hier.",
  "shared.publicLink": "Gedeeld via openbare link",
  "shared.album": "Album",

  // Photo viewer / lightbox
  "viewer.details": "Details",
  "viewer.download": "Offline bewaren",
  "viewer.freeUp": "Ruimte vrijmaken",
  "viewer.detailsShortcut": "Details (I)",
  "viewer.trashShortcut": "Naar prullenbak (Del)",
  "viewer.rename": "Klik om te hernoemen",
  "viewer.closeShortcut": "Sluiten (Esc)",
  "viewer.prev": "Vorige (←)",
  "viewer.next": "Volgende (→)",
  "viewer.name": "Naam",
  "viewer.type": "Type",
  "viewer.dimensions": "Afmetingen",
  "viewer.taken": "Genomen",
  "viewer.added": "Toegevoegd",
  "viewer.modified": "Gewijzigd",
  "viewer.size": "Grootte",
  "viewer.onServer": "Op server",
  "viewer.albums": "Albums",
  "viewer.shared": "Gedeeld",
  "viewer.sharedPublic": "Openbare link",
  "viewer.sharedPeople": "Met mensen",
  "viewer.sharedNo": "Nee",
  "viewer.unverified": " (niet geverifieerd)",
  "viewer.trashFailed": "kon niet naar de prullenbak worden verplaatst",
  "viewer.zoomOut": "Uitzoomen",
  "viewer.zoomIn": "Inzoomen",
  "viewer.resetFit": "Passend maken",
  "viewer.videoLoading": "Video laden…",
  "viewer.videoError": "Dit videoformaat kan hier niet worden afgespeeld. Download het om te bekijken.",
  "viewer.videoTooLarge": "Deze video is te groot om hier af te spelen. Download het om te bekijken.",

  // Upload panel
  "upload.title": "Uploaden",
  "upload.filterName": "Foto's en video's",
  "upload.dropHint": "Sleep foto's of een map ergens op het venster",
  "upload.dropSub":
    "Foto's gaan direct naar je tijdlijn. Een map wordt een album met dezelfde naam.",
  "upload.chooseFiles": "Bestanden kiezen",
  "upload.chooseFolder": "Map kiezen",
  "upload.alreadyThere": "{count} al aanwezig",
  "upload.failedCount": "{count} mislukt",
  "upload.clear": "Wissen",
  "upload.statusUploading": "uploaden…",
  "upload.statusSkipped": "overgeslagen",
  "upload.statusQueued": "in wachtrij",
  "upload.statusFailed": "mislukt",

  // Grid tile
  "grid.select": "Selecteren",
  "grid.deselect": "Deselecteren",

  // Selection bar
  "selection.cancel": "Selectie annuleren (Esc)",
  "selection.count.one": "{count} foto geselecteerd",
  "selection.count.other": "{count} foto's geselecteerd",
  "selection.trash": "Prullenbak",
  "selection.download": "Downloaden",
  "selection.freeUp": "Vrijmaken",
  "download.freedUp": "{count} vrijgemaakt",
  "download.notDownloaded": "Niets gedownload om vrij te maken",
  "download.running": "Downloaden…",
  "download.done": "{count} offline bewaard",
  "download.alreadyOffline": "Al offline beschikbaar",
  "download.partial": "{ok} opgeslagen, {failed} mislukt",

  // Trash confirmation
  "confirm.trashTitle": "Naar prullenbak verplaatsen?",
  "confirm.trashConfirm": "Naar prullenbak verplaatsen",
  "confirm.trashCount.one":
    "{count} foto wordt naar de prullenbak verplaatst. Je kunt hem herstellen vanuit Proton Drive.",
  "confirm.trashCount.other":
    "{count} foto's worden naar de prullenbak verplaatst. Je kunt ze herstellen vanuit Proton Drive.",
  "confirm.trashName":
    '"{name}" wordt naar de prullenbak verplaatst. Je kunt hem herstellen vanuit Proton Drive.',
  "confirm.thisPhoto": "Deze foto",
};
