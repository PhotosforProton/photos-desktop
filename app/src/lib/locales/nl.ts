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
  "nav.trash": "Prullenbak",

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
  "tray.locked": "Vergrendeld",
  "tray.lockedHint": "Openen om te ontgrendelen",
  "tray.signedOut": "Niet aangemeld",
  "tray.signedOutHint": "Openen om je aan te melden",

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
  "settings.general": "Algemeen",
  "settings.launchAtLogin": "Starten met Windows",
  "settings.launchAtLoginDesc": "Start op de achtergrond wanneer je je aanmeldt bij Windows en toont alleen het pictogram in het systeemvak totdat je de app opent.",
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
    "Download nieuwe foto's automatisch naar de map Proton Photos zodra ze aan je bibliotheek worden toegevoegd.",
  "settings.autoDownloadNeedsExplorer":
    "Werkt alleen als \"Proton Photos\" in Verkenner wordt getoond, en dat staat uit. Downloaden werkt gewoon: je wordt gevraagd waar je foto's worden opgeslagen.",
  "settings.restartNeeded": "Herstart om deze wijziging toe te passen.",
  "settings.restartNow": "Nu herstarten",
  // File types. The "Open with" entries are the app's own to add and take back out;
  // the default handler is not, so that half leads out to Windows rather than
  // pretending to a choice Windows takes from the user alone.
  "settings.fileTypes": "Bestandstypen",
  "settings.openWith": 'Toevoegen aan de lijst "Openen met"',
  "settings.openWithDesc":
    "Vermeldt Photos for Proton in het Windows-menu \"Openen met\" voor JPEG-, PNG-, GIF-, WebP-, AVIF-, BMP-, TIFF- en HEIC-foto's en voor MP4-, MOV-, M4V- en WebM-video's. Bij uitschakelen worden de vermeldingen weer verwijderd.",
  "settings.fileTypesFailed": "Kon de bestandstypen niet wijzigen. Probeer het opnieuw.",
  "settings.defaultApp": "Standaardapp voor foto's en video's",
  "settings.defaultAppDesc":
    "Zo wordt niets de standaardapp: Windows accepteert die keuze alleen van jou, nooit van een programma. Kies Photos for Proton in de Windows-instellingen onder Standaard-apps.",
  "settings.defaultAppOpen": "Windows-instellingen openen",
  "settings.defaultAppFailed": "Kon de Windows-instellingen niet openen. Probeer het opnieuw.",
  "settings.lockOnHideDesc":
    "Wanneer het venster naar het systeemvak wordt gesloten, vergrendelt de app en vraagt hij bij de volgende keer openen om je wachtwoord.",
  "settings.storage": "Opslag",
  // Two different places a photo can be kept on this machine: encrypted inside the
  // app, or downloaded into the Proton Photos folder where Windows can read it. The
  // panel names both rather than adding one number to the other.
  "settings.downloadedCount.one": "{count} foto gedownload",
  "settings.downloadedCount.other": "{count} foto's gedownload",
  "settings.downloadedNone": "Niets gedownload",
  "settings.downloadedDesc":
    "Gedownloade foto's zijn gewone bestanden in de map Proton Photos, dus Windows Zoeken en andere programma's kunnen ze lezen. Vrijmaken verwijdert alleen deze lokale kopieën, en je foto's blijven in Proton staan.",
  "settings.freeUpAll": "{size} vrijmaken",
  "settings.freeUpNothing": "Niets vrij te maken",
  "settings.freeingUp": "Bezig met vrijmaken…",
  "settings.storageOffline": "Offline foto's",
  "settings.storageExplorer": "In Verkenner",
  "settings.offlineCount.one": "{count} foto in de app",
  "settings.offlineCount.other": "{count} foto's in de app",
  "settings.offlineNone": "Geen foto's in de app bewaard",
  "settings.offlineDesc":
    "Foto's die je als offline beschikbaar markeert, blijven versleuteld in de app. Ze openen zonder verbinding en verschijnen nooit in de map Proton Photos, dus niets buiten de app kan ze lezen.",
  "settings.offlineSaving": "Opslaan {done}/{total}…",
  "settings.offlineRemoveAll": "{size} vrijmaken",
  "settings.offlineRemoveNothing": "Niets vrij te maken",
  "settings.offlineRemoving": "Bezig met verwijderen…",
  "settings.freeUpFailed": "Kon de ruimte niet vrijmaken. Probeer het opnieuw.",

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
  "photos.offline": "Offline beschikbaar, versleuteld in de app",
  "photos.downloaded": "Gedownload naar de map Proton Photos",
  "photos.renameTitle": "Fotonaam wijzigen",
  "photos.namePlaceholder": "Bestandsnaam",

  // Tile badges
  "badge.motionPhoto": "Bewegende foto",
  "badge.panorama": "Panorama",
  "badge.raw": "RAW",
  "badge.favorite": "Favoriet",

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
  "albums.noneSub": "Maak er hier een, of sleep een map op het venster.",
  "albums.keepDownloaded": "Dit album naar de map Proton Photos downloaden",
  "albums.keptDownloaded": "Downloaden naar de map Proton Photos (klik om te stoppen)",
  "albums.freeUpTitle": "Ruimte van dit album vrijmaken?",
  "albums.freeUpCount.one":
    "Het album downloadt zichzelf niet meer. {count} foto staat al in de map Proton Photos en kan blijven staan, of je maakt de ruimte vrij die hij inneemt. De foto blijft in beide gevallen in Proton staan.",
  "albums.freeUpCount.other":
    "Het album downloadt zichzelf niet meer. {count} foto's staan al in de map Proton Photos en kunnen blijven staan, of je maakt de ruimte vrij die ze innemen. De foto's blijven in beide gevallen in Proton staan.",
  "albums.freeUpKeep": "Gedownload houden",
  "albums.freeUpConfirm": "Vrijmaken",
  "albums.newAlbum": "Nieuw album",
  "albums.newTitle": "Geef het album een naam",
  "albums.namePlaceholder": "Albumnaam",
  "albums.create": "Maken",
  "albums.createAndAdd": "Maken en toevoegen",
  "albums.rename": "Naam wijzigen",
  "albums.renameTitle": "Albumnaam wijzigen",
  "albums.share": "Album delen",
  "albums.delete": "Album verwijderen",
  "albums.deleted": "Album verwijderd",
  "albums.addTitle": "Aan album toevoegen",
  "albums.addCount.one": "Kies waar {count} foto naartoe moet.",
  "albums.addCount.other": "Kies waar {count} foto's naartoe moeten.",
  "albums.added": "{count} toegevoegd",
  "albums.addPartial": "{ok} toegevoegd, {failed} mislukt",
  "albums.removed": "{count} uit het album gehaald",
  "albums.removePartial": "{ok} verwijderd, {failed} mislukt",
  "albums.coverSet": "Omslag bijgewerkt",
  "albums.strandedTitle.one": "{count} foto staat alleen in dit album",
  "albums.strandedTitle.other": "{count} foto's staan alleen in dit album",
  "albums.strandedMsg.one":
    "Hij staat niet op je tijdlijn, dus met het album verdwijnt hij ook. Bewaar hem op je tijdlijn om hem te houden.",
  "albums.strandedMsg.other":
    "Ze staan niet op je tijdlijn, dus met het album verdwijnen ze ook. Bewaar ze op je tijdlijn om ze te houden.",
  "albums.savePhotos": "Op tijdlijn bewaren",
  "albums.deletePhotosToo": "Foto's ook verwijderen",

  // Shared
  "shared.byMe": "Door mij gedeeld",
  "shared.withMe": "Met mij gedeeld",
  "shared.flip": "Wisselen tussen door mij gedeeld en met mij gedeeld",
  "shared.emptyByTitle": "Je deelt niets",
  "shared.emptyWithTitle": "Niets met je gedeeld",
  "shared.emptyBySub": "Foto's en albums die je deelt, verschijnen hier.",
  "shared.emptyWithSub": "Foto's en albums die anderen met je delen, verschijnen hier.",
  "shared.publicLink": "Gedeeld via openbare link",
  "shared.album": "Album",
  "shared.manage": "Delen beheren",
  "shared.back": "Terug naar gedeeld",

  // Share dialog. A public link's URL carries the secret that decrypts what it
  // points at, so copying it whole is the whole point of the link section. A
  // link's password is never read back, so the dialog reports whether one is set
  // rather than showing it.
  "share.title": "Delen",
  "share.linkTitle": "Openbare link",
  "share.linkDesc": "Iedereen met de link kan deze foto openen.",
  "share.createLink": "Link maken",
  "share.copyLink": "Link kopiëren",
  "share.copied": "Gekopieerd",
  "share.removeLink": "Link verwijderen",
  "share.passwordLabel": "Wachtwoord",
  "share.passwordSet": "Nodig om te openen",
  "share.passwordNone": "Niet ingesteld",
  "share.passwordPlaceholder": "Nieuw wachtwoord",
  "share.expiryLabel": "Verloopt",
  "share.expiryNever": "Nooit",
  "share.expiryPast": "Kies een datum in de toekomst.",
  "share.add": "Toevoegen",
  "share.change": "Wijzigen",
  "share.set": "Instellen",
  "share.save": "Opslaan",
  "share.albumInviteOnly": "Albums worden gedeeld via een uitnodiging, niet via een openbare link.",
  "share.peopleTitle": "Mensen",
  "share.emailPlaceholder": "E-mailadres",
  "share.invite": "Uitnodigen",
  "share.roleViewer": "Lezer",
  "share.roleEditor": "Bewerker",
  "share.stateInvited": "Uitgenodigd",
  "share.stateExternal": "Uitgenodigd (geen Proton-account)",
  "share.remove": "Verwijderen",
  "share.noPeople": "Nog niemand",
  "share.stopSharing": "Stoppen met delen",
  "share.notOwned": "Dit is met jou gedeeld. Alleen de eigenaar kan wijzigen wie erbij kan.",
  "share.badEmail": "Dat lijkt geen e-mailadres.",
  "share.copyFailed": "Kon de link niet kopiëren",
  "share.failed": "Kon het delen niet bijwerken",
  "share.working": "Bezig…",

  // Trash
  "trash.emptyTitle": "De prullenbak is leeg",
  "trash.emptySub":
    "Foto's die je naar de prullenbak verplaatst, verschijnen hier en kun je herstellen.",
  "trash.emptyAction": "Prullenbak legen",
  "trash.moved": "{count} naar de prullenbak verplaatst",
  "trash.movedPartial": "{ok} naar de prullenbak verplaatst, {failed} mislukt",
  "trash.restored": "{count} hersteld",
  "trash.deleted": "{count} definitief verwijderd",
  "trash.emptied": "Prullenbak geleegd",
  "trash.partial": "{ok} gelukt, {failed} mislukt",

  // Photo viewer / lightbox
  "viewer.details": "Details",
  "viewer.offlineAdd": "Offlinekopie bewaren, versleuteld in de app",
  "viewer.offlineRemove": "Offline-kopie verwijderen",
  "viewer.download": "Downloaden naar de map Proton Photos",
  "viewer.saveToFolder": "Een kopie opslaan waar je wilt",
  "viewer.freeUp": "De lokale kopie verwijderen om ruimte vrij te maken",
  "viewer.detailsShortcut": "Details (I)",
  "viewer.contents": "Inhoud",
  "viewer.contentsShortcut": "Inhoud (L)",
  "viewer.filmstrip": "Omliggende items",
  "viewer.position": "{n} van {total}",
  "viewer.favoriteShortcut": "Toevoegen aan favorieten (F)",
  "viewer.unfavoriteShortcut": "Verwijderen uit favorieten (F)",
  "viewer.trashShortcut": "Naar prullenbak (Del)",
  "viewer.shareShortcut": "Delen (S)",
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
  "viewer.onServer": "Gebruikte opslag",
  "viewer.albums": "Albums",
  "viewer.shared": "Gedeeld",
  "viewer.sharedPublic": "Openbare link",
  "viewer.sharedPeople": "Met mensen",
  "viewer.sharedNo": "Nee",
  "viewer.unverified": " (niet geverifieerd)",
  "viewer.trashFailed": "Deze foto kon niet naar de prullenbak worden verplaatst.",
  "viewer.favoriteFailed": "Favorieten konden niet worden bijgewerkt.",
  "viewer.downloadFailed": "Deze foto kon niet worden gedownload.",
  "viewer.zoomOut": "Uitzoomen",
  "viewer.zoomIn": "Inzoomen",
  "viewer.resetFit": "Passend maken",
  "viewer.videoLoading": "Video laden…",
  "viewer.videoError":
    "Dit videoformaat kan hier niet worden afgespeeld. Download het en bekijk het in een andere speler.",
  "viewer.videoTooLarge":
    "Deze video is te groot om hier af te spelen. Download hem en bekijk hem in een andere speler.",

  // The viewer's own video controls, which stand in for the browser's.
  "viewer.videoPlay": "Afspelen (Spatie)",
  "viewer.videoPause": "Pauzeren (Spatie)",
  "viewer.videoStepBack": "Vorig frame",
  "viewer.videoStepForward": "Volgend frame",
  "viewer.videoSeek": "Afspeelpositie",
  "viewer.videoMute": "Dempen",
  "viewer.videoUnmute": "Dempen opheffen",

  // Local file viewer: a file opened from File Explorer, which the app can show
  // with nobody signed in. Everything both viewers say alike comes from above.
  "local.camera": "Camera",
  "local.created": "Gemaakt",
  "local.path": "Locatie",
  "local.upload": "Uploaden naar Proton",
  "local.uploadUnsupported": "Proton accepteert dit bestandstype niet",
  "local.uploading": "Uploaden…",
  "local.uploaded": "Opgeslagen bij Proton",
  "local.uploadSkipped": "Al opgeslagen",
  "local.uploadFailed": "Uploaden mislukt. Probeer het opnieuw.",
  "local.delete": "Verwijderen",
  "local.deleteTitle": "Dit bestand verwijderen?",
  "local.deleteMessage": "‘{name}’ wordt naar de prullenbak verplaatst.",
  "local.notFound": "Dit bestand is verplaatst of verwijderd.",
  "local.unreadable":
    "Dit bestand kon niet worden gelezen. Misschien staat het open in een ander programma, of is het niet bereikbaar voor dit account.",
  "local.openFailed": "Dit bestand kon niet worden geopend.",
  "local.decodeFailed":
    "Deze foto kon niet worden gelezen. Het bestand is mogelijk beschadigd of onvolledig.",
  "local.videoUnsupported":
    "Dit videoformaat kan hier niet worden afgespeeld. Open het in een andere speler.",
  "local.noCodec":
    "Windows heeft geen decoder voor dit formaat, dus het kan hier niet worden getoond. In de Microsoft Store staat wat er voor sommige ontbreekt: de HEIF- en HEVC-extensies voor HEIC-foto's, en Raw Image Extension voor raw-bestanden van camera's.",
  "local.signInTitle": "Aanmelden om te uploaden",
  "local.signInBody":
    "Het venster van de app gaat open zodat je kunt inloggen. Dit bestand blijft hier open.",
  "local.signInAction": "Aanmelden",

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
  "selection.restore": "Herstellen",
  "selection.deleteForever": "Definitief verwijderen",
  "selection.more": "Meer",
  "selection.download": "Downloaden",
  "selection.freeUp": "Vrijmaken",
  "selection.addToAlbum": "Aan album toevoegen",
  "selection.removeFromAlbum": "Uit album halen",
  "selection.setCover": "Als omslag instellen",
  "selection.rename": "Naam wijzigen",
  "selection.share": "Delen",
  "selection.favorite": "Toevoegen aan favorieten",
  "selection.unfavorite": "Verwijderen uit favorieten",
  "selection.offlineAdd": "Offline beschikbaar",
  "selection.offlineRemove": "Offline-kopie verwijderen",
  // Download: the copy that lands in the Proton Photos folder, where Windows and any
  // other program can read it. Never called offline, which is the app's own copy.
  "download.freedUp": "{count} vrijgemaakt",
  "download.freedUpNone": "Er is niets vrijgemaakt",
  "download.notDownloaded": "Niets gedownload om vrij te maken",
  "download.running": "Downloaden…",
  "download.progress": "Downloaden {done}/{total}…",
  "download.done": "{count} gedownload naar de map Proton Photos",
  "download.donePartial": "{ok} van {total} gedownload",
  "download.doneNone":
    "Er is niets gedownload. De map Proton Photos is mogelijk nog niet gereed.",
  "download.alreadyDownloaded": "Al gedownload",
  "download.saved": "{count} opgeslagen in de map",
  "download.partial": "{ok} opgeslagen, {failed} mislukt",

  // Available offline: the app's own encrypted copy, which is not the Proton Photos
  // folder. These say where the copy went, so the two are never mistaken for one another.
  "offline.added.one": "{count} foto wordt opgeslagen om offline te gebruiken",
  "offline.added.other": "{count} foto's worden opgeslagen om offline te gebruiken",
  "offline.removed.one": "{count} offline-kopie verwijderd",
  "offline.removed.other": "{count} offline-kopieën verwijderd",
  "offline.alreadyOffline": "Al offline beschikbaar",
  "offline.noneOffline": "Geen offline-kopieën om te verwijderen",
  "offline.failed": "kon niet offline worden opgeslagen",

  // Trash confirmation
  "confirm.trashTitle": "Naar prullenbak verplaatsen?",
  "confirm.trashConfirm": "Naar prullenbak verplaatsen",
  "confirm.trashCount.one":
    "{count} foto wordt naar de prullenbak verplaatst. Je kunt hem herstellen op het tabblad Prullenbak.",
  "confirm.trashCount.other":
    "{count} foto's worden naar de prullenbak verplaatst. Je kunt ze herstellen op het tabblad Prullenbak.",
  "confirm.trashName":
    '"{name}" wordt naar de prullenbak verplaatst. Je kunt hem herstellen op het tabblad Prullenbak.',
  "confirm.thisPhoto": "Deze foto",

  // Remove from album. The photos stay in Photos; only the album loses them.
  "confirm.removeTitle": "Uit album halen?",
  "confirm.removeConfirm": "Verwijderen",
  "confirm.removeCount.one": "{count} foto gaat uit dit album en blijft op je tijdlijn staan.",
  "confirm.removeCount.other": "{count} foto's gaan uit dit album en blijven op je tijdlijn staan.",

  // Delete-forever confirmation. Nothing in the app or at Proton undoes these.
  "confirm.deleteTitle": "Definitief verwijderen?",
  "confirm.deleteConfirm": "Definitief verwijderen",
  "confirm.deleteCount.one":
    "{count} foto wordt permanent van Proton verwijderd. Dit kan niet ongedaan worden gemaakt.",
  "confirm.deleteCount.other":
    "{count} foto's worden permanent van Proton verwijderd. Dit kan niet ongedaan worden gemaakt.",
  "confirm.emptyTitle": "Prullenbak legen?",
  "confirm.emptyConfirm": "Alles verwijderen",
  "confirm.emptyMessage":
    "Alles in de prullenbak wordt permanent van Proton verwijderd. Dit kan niet ongedaan worden gemaakt.",

  // Deleting an album skips the trash, so the album is gone for good even though
  // the photos in your timeline are not.
  "confirm.deleteAlbumTitle": "Dit album verwijderen?",
  "confirm.deleteAlbumMessage":
    "Het album wordt verwijderd en kan niet worden hersteld. Foto's op je tijdlijn blijven staan.",

  // Revoking sharing takes access away from people who may already hold the link,
  // and nothing is deleted by it, so both of these say exactly what is lost.
  "confirm.removeLinkTitle": "Link verwijderen?",
  "confirm.removeLinkMessage":
    "De link werkt niet meer voor iedereen die hem heeft. Mensen die per e-mail zijn uitgenodigd, houden hun toegang.",
  "confirm.removeLinkConfirm": "Link verwijderen",
  "confirm.replaceLinkTitle": "Link vervangen?",
  "confirm.replaceLinkMessage":
    "Deze link is te oud om te wijzigen, dus bij het opslaan wordt hij vervangen door een nieuwe op een ander adres. De oude link werkt niet meer voor iedereen die hem heeft en het wachtwoord ervan vervalt. De nieuwe link komt op je klembord.",
  "confirm.replaceLinkConfirm": "Link vervangen",
  "confirm.stopSharingTitle": "Stoppen met delen?",
  "confirm.stopSharingMessage":
    "De link werkt niet meer en iedereen die is uitgenodigd verliest de toegang. Er wordt niets verwijderd.",
  "confirm.stopSharingConfirm": "Stoppen met delen",

  // Freeing up drops the downloaded copies only. Nothing leaves Proton, so this asks
  // before a big change without treating it as one there is no way back from.
  "confirm.freeUpAllTitle": "Alle gedownloade foto's vrijmaken?",
  "confirm.freeUpAllMessage":
    "De {size} in de map Proton Photos wordt verwijderd. Je foto's blijven in Proton staan en worden opnieuw gedownload zodra je ze opent.",
  "confirm.freeUpAllConfirm": "Vrijmaken",

  // Removing every offline copy. The photos themselves are untouched, so this warns
  // about the download they will need next time and nothing more.
  "confirm.removeOfflineAllTitle": "Alle offline-kopieën verwijderen?",
  "confirm.removeOfflineAllMessage":
    "De {size} die de app versleuteld bewaart, wordt verwijderd. Je foto's blijven in Proton staan en hebben weer een verbinding nodig om te openen.",
  "confirm.removeOfflineAllConfirm": "Verwijderen",
};
