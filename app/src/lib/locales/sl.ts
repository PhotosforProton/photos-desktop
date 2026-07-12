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

// Slovenian (sl) strings. Keys mirror en.ts exactly.
export const sl: Record<string, string> = {
  // Common
  "common.cancel": "Prekliči",
  "common.close": "Zapri",
  "common.back": "Nazaj",
  "common.loading": "Nalaganje…",
  "common.photoCount.one": "{count} fotografija",
  "common.photoCount.other": "{count} fotografij",

  // Navigation
  "nav.photos": "Fotografije",
  "nav.albums": "Albumi",
  "nav.shared": "V skupni rabi",

  // App shell
  "app.restoring": "Obnavljanje seje…",
  "update.available": "Na voljo je posodobitev {version}",
  "update.now": "Posodobi",
  "update.updating": "Posodabljanje…",
  "update.failed": "Posodobitev ni uspela",
  "update.hashError": "Prenos ni prestal preverjanja",
  "menu.reload": "Znova naloži",
  "menu.moreSoon": "Kmalu več…",
  "menu.quit": "Končaj",

  // Tray popup
  "tray.open": "Odpri Photos for Proton",
  "tray.syncNow": "Sinhroniziraj zdaj",
  "tray.syncing": "Sinhroniziranje…",
  "tray.synced": "Posodobljeno",

  // Login
  "login.subtitle": "Prijavi se v svoj račun Proton",
  "login.emailLabel": "E-pošta ali uporabniško ime",
  "login.passwordLabel": "Geslo",
  "login.passwordPlaceholder": "Geslo",
  "login.signIn": "Prijava",
  "login.signingIn": "Prijavljanje…",
  "login.twofaLabel": "Dvofaktorska koda",
  "login.verify": "Potrdi",
  "login.verifying": "Preverjanje…",
  "login.captchaHint": "Proton želi, da potrdiš, da si človek.",
  "login.captchaExpired": "Captcha je potekla. Reši jo znova.",

  // Lock screen (returning cold start)
  "lock.subtitle": "Za odklep vnesi geslo",
  "lock.unlock": "Odkleni",
  "lock.unlocking": "Odklepanje…",
  "lock.wrongPassword": "Napačno geslo",
  "lock.failed": "Odklep ni uspel. Poskusi znova.",
  "lock.differentAccount": "Uporabi drug račun",

  // Titlebar
  "titlebar.minimize": "Pomanjšaj",
  "titlebar.maximize": "Maksimiraj",

  // Settings
  "settings.title": "Nastavitve",
  "settings.appearance": "Videz",
  "settings.theme": "Tema",
  "settings.themeDesc": "Sistem sledi Windowsu in se ob spremembah samodejno prilagaja.",
  "settings.theme.dark": "Temna",
  "settings.theme.light": "Svetla",
  "settings.theme.system": "Sistem",
  "settings.palette": "Paleta",
  "settings.paletteDesc": "Poudarna barva, uporabljena po vsej aplikaciji.",
  "settings.palette.default": "Privzeta",
  "settings.palette.forest": "Gozd",
  "settings.palette.sunset": "Sončni zahod",
  "settings.palette.sea": "Morje",
  "settings.palette.sepia": "Sepija",
  "settings.palette.mono": "Mono",
  "settings.palette.amoled": "Čisto črna (AMOLED)",
  "settings.language": "Jezik",
  "settings.languageDesc": "Izberi jezik prikaza.",
  "settings.timeline": "Časovnica",
  "settings.hideAlbum": "Skrij fotografije v albumih Drive",
  "settings.hideAlbumDesc":
    "Fotografije, dodane v album Drive, se ne prikažejo na tvoji glavni časovnici. Še naprej so vidne v zavihkih Albumi in V skupni rabi ter v filtrih kategorij.",
  "settings.security": "Varnost",
  "settings.lockOnHide": "Zahtevaj geslo ob ponovnem odpiranju iz sistemske vrstice",
  "settings.debug": "Razhroščevalni prekrivni sloj",
  "settings.debugDesc": "Prikaži živ prikaz pomnilnika (velikost kopice in predpomnilnika).",
  "settings.explorer": "Raziskovalec",
  "settings.showInExplorer": 'Pokaži "Proton Photos" v Raziskovalcu',
  "settings.showInExplorerDesc":
    "V stransko vrstico Raziskovalca doda vnos Proton Photos s tvojimi fotografijami v oblaku. Učinkuje po ponovnem zagonu.",
  "settings.autoDownload": "Samodejno prenašaj nove fotografije",
  "settings.autoDownloadDesc":
    "Ko se v tvojo knjižnico dodajo nove fotografije, samodejno ohrani kopijo v tej napravi.",
  "settings.restartNeeded": "Za uveljavitev te spremembe znova zaženi aplikacijo.",
  "settings.restartNow": "Znova zaženi zdaj",
  "settings.lockOnHideDesc":
    "Ko okno skriješ v sistemsko vrstico, se aplikacija zaklene in ob naslednjem odpiranju vpraša za geslo.",

  // Profile menu
  "profile.storage": "Shramba",
  "profile.used": "{size} uporabljeno",
  "profile.total": "{size} skupaj",
  "profile.signOut": "Odjava",

  // Avatar
  "avatar.uploading": "Nalaganje",
  "avatar.syncing": "Sinhroniziranje",
  "avatar.account": "Račun in nastavitve",
  "avatar.showUploads": "Pokaži nalaganja",

  // Photos view
  "photos.all": "Vse",
  "photos.search": "Iskanje",
  "photos.searchPlaceholder": "Išči po imenu datoteke ali vrsti…",
  "photos.closeSearch": "Zapri iskanje",
  "photos.smaller": "Manjše",
  "photos.bigger": "Večje",
  "photos.indexing": "Indeksiranje {done}/{total}",
  "photos.uploadTitle": "Naloži fotografije ali mapo kot album",
  "photos.uploadingProgress": "Nalaganje {progress}",
  "photos.noMatches": "Ni zadetkov",
  "photos.noPhotos": "Še ni fotografij",
  "photos.noPhotosSub": "Tvoje fotografije se bodo prikazale tukaj po sinhronizaciji.",
  "photos.stillIndexing": "Indeksiranje še poteka, prikazalo se bo več rezultatov.",
  "photos.loadingThumbnails": "Nalaganje sličic…",
  "photos.dropTitle": "Spusti za nalaganje",
  "photos.dropSub": "Mapa postane album z enakim imenom",
  "photos.offline": "Na voljo brez povezave",

  // Search type filters
  "filter.images": "Slike",
  "filter.videos": "Videoposnetki",

  // Filter panel
  "filter.title": "Filter",
  "filter.categories": "Kategorije",
  "filter.type": "Vrsta",
  "filter.mediaAll": "Vse",
  "filter.mediaPhotos": "Fotografije",
  "filter.reset": "Ponastavi",

  // Categories
  "category.fav": "Priljubljene",
  "category.screen": "Posnetki zaslona",
  "category.video": "Videoposnetki",
  "category.live": "Žive fotografije",
  "category.selfie": "Selfiji",
  "category.portrait": "Portreti",
  "category.burst": "Zaporedni posnetki",
  "category.pano": "Panorame",
  "category.raw": "RAW",

  // Albums
  "albums.backToAlbums": "Nazaj na albume",
  "albums.untitled": "Neimenovan album",
  "albums.empty": "Ta album je prazen",
  "albums.none": "Še ni albumov",
  "albums.noneSub": "Spusti mapo na okno, da ga ustvariš.",
  "albums.keepOffline": "Obdrži ta album v tej napravi",
  "albums.keptOffline": "Obdržano v tej napravi (klikni za ustavitev)",

  // Shared
  "shared.byMe": "Deljeno z drugimi",
  "shared.withMe": "Deljeno z mano",
  "shared.emptyByTitle": "Ničesar ne deliš",
  "shared.emptyWithTitle": "Nič ni deljeno s tabo",
  "shared.emptyBySub": "Fotografije in albumi, ki jih deliš, se prikažejo tukaj.",
  "shared.emptyWithSub": "Fotografije in albumi, ki jih drugi delijo s tabo, se prikažejo tukaj.",
  "shared.publicLink": "Deljeno prek javne povezave",
  "shared.album": "Album",

  // Photo viewer / lightbox
  "viewer.details": "Podrobnosti",
  "viewer.download": "Obdrži brez povezave",
  "viewer.freeUp": "Sprosti prostor",
  "viewer.detailsShortcut": "Podrobnosti (I)",
  "viewer.trashShortcut": "Premakni v koš (Del)",
  "viewer.rename": "Klikni za preimenovanje",
  "viewer.closeShortcut": "Zapri (Esc)",
  "viewer.prev": "Prejšnja (←)",
  "viewer.next": "Naslednja (→)",
  "viewer.name": "Ime",
  "viewer.type": "Vrsta",
  "viewer.dimensions": "Dimenzije",
  "viewer.taken": "Posneto",
  "viewer.added": "Dodano",
  "viewer.modified": "Spremenjeno",
  "viewer.size": "Velikost",
  "viewer.onServer": "Na strežniku",
  "viewer.albums": "Albumi",
  "viewer.shared": "V skupni rabi",
  "viewer.sharedPublic": "Javna povezava",
  "viewer.sharedPeople": "Z ljudmi",
  "viewer.sharedNo": "Ne",
  "viewer.unverified": " (nepreverjeno)",
  "viewer.trashFailed": "premik v koš ni uspel",
  "viewer.zoomOut": "Oddalji",
  "viewer.zoomIn": "Približaj",
  "viewer.resetFit": "Ponastavi povečavo",
  "viewer.videoLoading": "Nalaganje videa…",
  "viewer.videoError": "Tega formata videa tukaj ni mogoče predvajati. Prenesi ga za ogled.",
  "viewer.videoTooLarge": "Ta video je prevelik za predvajanje tukaj. Prenesi ga za ogled.",

  // Upload panel
  "upload.title": "Nalaganje",
  "upload.filterName": "Fotografije in videoposnetki",
  "upload.dropHint": "Spusti fotografije ali mapo kamor koli na okno",
  "upload.dropSub":
    "Fotografije gredo naravnost na tvojo časovnico. Mapa postane album z enakim imenom.",
  "upload.chooseFiles": "Izberi datoteke",
  "upload.chooseFolder": "Izberi mapo",
  "upload.alreadyThere": "{count} že obstaja",
  "upload.failedCount": "{count} ni uspelo",
  "upload.clear": "Počisti",
  "upload.statusUploading": "nalaganje…",
  "upload.statusSkipped": "preskočeno",
  "upload.statusQueued": "v čakalni vrsti",
  "upload.statusFailed": "ni uspelo",

  // Grid tile
  "grid.select": "Izberi",
  "grid.deselect": "Prekliči izbor",

  // Selection bar
  "selection.cancel": "Prekliči izbor (Esc)",
  "selection.count.one": "Izbrana {count} fotografija",
  "selection.count.other": "Izbranih {count} fotografij",
  "selection.trash": "Koš",
  "selection.download": "Prenesi",
  "selection.freeUp": "Sprosti",
  "download.freedUp": "{count} sproščenih",
  "download.notDownloaded": "Ni prenesenega za sprostitev",
  "download.running": "Prenašanje…",
  "download.done": "{count} obdržanih brez povezave",
  "download.alreadyOffline": "Že na voljo brez povezave",
  "download.partial": "Shranjenih {ok}, {failed} ni uspelo",

  // Trash confirmation
  "confirm.trashTitle": "Premakniti v koš?",
  "confirm.trashConfirm": "Premakni v koš",
  "confirm.trashCount.one":
    "{count} fotografija bo premaknjena v koš. Obnoviš jo lahko iz Proton Drive.",
  "confirm.trashCount.other":
    "{count} fotografij bo premaknjenih v koš. Obnoviš jih lahko iz Proton Drive.",
  "confirm.trashName":
    '"{name}" bo premaknjena v koš. Obnoviš jo lahko iz Proton Drive.',
  "confirm.thisPhoto": "Ta fotografija",
};
