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

// Hungarian strings. Keys mirror en.ts exactly.
export const hu: Record<string, string> = {
  // Common
  "common.cancel": "Mégse",
  "common.close": "Bezárás",
  "common.back": "Vissza",
  "common.loading": "Betöltés…",
  "common.photoCount.one": "{count} fotó",
  "common.photoCount.other": "{count} fotó",

  // Navigation
  "nav.photos": "Fotók",
  "nav.albums": "Albumok",
  "nav.shared": "Megosztott",

  // App shell
  "app.restoring": "Munkamenet visszaállítása…",
  "update.available": "Elérhető a {version} frissítés",
  "update.now": "Frissítés",
  "update.updating": "Frissítés…",
  "update.failed": "A frissítés nem sikerült",
  "update.hashError": "A letöltés ellenőrzése sikertelen",
  "menu.reload": "Újratöltés",
  "menu.moreSoon": "Hamarosan több…",
  "menu.quit": "Kilépés",

  // Tray popup
  "tray.open": "Photos for Proton megnyitása",
  "tray.syncNow": "Szinkronizálás most",
  "tray.syncing": "Szinkronizálás…",
  "tray.synced": "Naprakész",

  // Login
  "login.subtitle": "Jelentkezz be a Proton-fiókodba",
  "login.emailLabel": "E-mail vagy felhasználónév",
  "login.passwordLabel": "Jelszó",
  "login.passwordPlaceholder": "Jelszó",
  "login.signIn": "Belépés",
  "login.signingIn": "Belépés…",
  "login.twofaLabel": "Kétlépcsős kód",
  "login.verify": "Ellenőrzés",
  "login.verifying": "Ellenőrzés…",
  "login.captchaHint": "A Proton megerősítést kér, hogy nem robot vagy.",
  "login.captchaExpired": "A captcha lejárt. Oldd meg újra.",

  // Lock screen (returning cold start)
  "lock.subtitle": "Add meg a jelszavad a feloldáshoz",
  "lock.unlock": "Feloldás",
  "lock.unlocking": "Feloldás…",
  "lock.wrongPassword": "Hibás jelszó",
  "lock.failed": "A feloldás nem sikerült. Próbáld újra.",
  "lock.differentAccount": "Másik fiók használata",

  // Titlebar
  "titlebar.minimize": "Kis méret",
  "titlebar.maximize": "Teljes méret",

  // Settings
  "settings.title": "Beállítások",
  "settings.appearance": "Megjelenés",
  "settings.theme": "Téma",
  "settings.themeDesc": "A rendszer a Windowst követi, és a változásait is.",
  "settings.theme.dark": "Sötét",
  "settings.theme.light": "Világos",
  "settings.theme.system": "Rendszer",
  "settings.palette": "Paletta",
  "settings.paletteDesc": "Az alkalmazásban használt kiemelőszín.",
  "settings.palette.default": "Alapértelmezett",
  "settings.palette.forest": "Erdő",
  "settings.palette.sunset": "Naplemente",
  "settings.palette.sea": "Tenger",
  "settings.palette.sepia": "Szépia",
  "settings.palette.mono": "Mono",
  "settings.palette.amoled": "Tiszta fekete (AMOLED)",
  "settings.language": "Nyelv",
  "settings.languageDesc": "Válaszd ki a megjelenítés nyelvét.",
  "settings.timeline": "Idővonal",
  "settings.hideAlbum": "Drive-albumok fotóinak elrejtése",
  "settings.hideAlbumDesc":
    "A Drive-albumba tett fotók nem jelennek meg a fő idővonalon. Az Albumok és a Megosztott lapon, valamint a kategóriaszűrőkben továbbra is láthatók.",
  "settings.security": "Biztonság",
  "settings.lockOnHide": "Kérjen jelszót, amikor a tálcáról visszanyitom",
  "settings.debug": "Debug réteg",
  "settings.debugDesc": "Élő memória-HUD (heap és cache-méretek).",
  "settings.explorer": "Fájlkezelő",
  "settings.showInExplorer": "„Proton Photos” a Fájlkezelőben",
  "settings.showInExplorerDesc":
    "Megjeleníti a Proton Photos bejegyzést az Intéző oldalsávjában a felhős fotókkal. Újraindítás után lép életbe.",
  "settings.autoDownload": "Új fotók automatikus letöltése",
  "settings.autoDownloadDesc":
    "Ahogy új fotók kerülnek a könyvtáradba, automatikusan megőrződik egy másolatuk ezen az eszközön.",
  "settings.restartNeeded": "Újraindítás szükséges a módosításhoz.",
  "settings.restartNow": "Újraindítás most",
  "settings.lockOnHideDesc":
    "Amikor az ablak a tálcára kerül, az alkalmazás zárolttá válik, és legközelebb a jelszavaddal nyithatod meg.",

  // Profile menu
  "profile.storage": "Tárhely",
  "profile.used": "{size} használatban",
  "profile.total": "{size} összesen",
  "profile.signOut": "Kijelentkezés",

  // Avatar
  "avatar.uploading": "Feltöltés",
  "avatar.syncing": "Szinkronizálás",
  "avatar.account": "Fiók és beállítások",
  "avatar.showUploads": "Feltöltések megjelenítése",

  // Photos view
  "photos.all": "Összes",
  "photos.search": "Keresés",
  "photos.searchPlaceholder": "Keresés fájlnév vagy típus szerint…",
  "photos.closeSearch": "Keresés bezárása",
  "photos.smaller": "Kisebb",
  "photos.bigger": "Nagyobb",
  "photos.indexing": "Indexelés {done}/{total}",
  "photos.uploadTitle": "Fotók feltöltése, vagy egy mappa albumként",
  "photos.uploadingProgress": "Feltöltés {progress}",
  "photos.noMatches": "Nincs találat",
  "photos.noPhotos": "Még nincsenek fotók",
  "photos.noPhotosSub": "A fotóid itt jelennek meg a szinkronizálás után.",
  "photos.stillIndexing": "Az indexelés folyamatban, több találat is megjelenik.",
  "photos.loadingThumbnails": "Bélyegképek betöltése…",
  "photos.dropTitle": "Húzd ide a feltöltéshez",
  "photos.dropSub": "A mappából azonos nevű album lesz",
  "photos.offline": "Elérhető offline",

  // Search type filters
  "filter.images": "Képek",
  "filter.videos": "Videók",

  // Filter panel
  "filter.title": "Szűrő",
  "filter.categories": "Kategóriák",
  "filter.type": "Típus",
  "filter.mediaAll": "Összes",
  "filter.mediaPhotos": "Fotók",
  "filter.reset": "Visszaállítás",

  // Categories
  "category.fav": "Kedvencek",
  "category.screen": "Képernyőképek",
  "category.video": "Videók",
  "category.live": "Élő fotók",
  "category.selfie": "Szelfik",
  "category.portrait": "Portrék",
  "category.burst": "Sorozatok",
  "category.pano": "Panorámák",
  "category.raw": "RAW",

  // Albums
  "albums.backToAlbums": "Vissza az albumokhoz",
  "albums.untitled": "Névtelen album",
  "albums.empty": "Ez az album üres",
  "albums.none": "Még nincsenek albumok",
  "albums.noneSub": "Húzz egy mappát az ablakra egy létrehozásához.",
  "albums.keepOffline": "Album megtartása ezen az eszközön",
  "albums.keptOffline": "Az eszközön tartva (kattints a leállításhoz)",

  // Shared
  "shared.byMe": "Általam megosztott",
  "shared.withMe": "Velem megosztott",
  "shared.emptyByTitle": "Nem osztasz meg semmit",
  "shared.emptyWithTitle": "Nincs veled megosztva semmi",
  "shared.emptyBySub": "Az általad megosztott fotók és albumok itt jelennek meg.",
  "shared.emptyWithSub": "A veled megosztott fotók és albumok itt jelennek meg.",
  "shared.publicLink": "Megosztva nyilvános linkkel",
  "shared.album": "Album",

  // Photo viewer / lightbox
  "viewer.details": "Részletek",
  "viewer.download": "Letöltés eszközre",
  "viewer.freeUp": "Hely felszabadítása",
  "viewer.detailsShortcut": "Részletek (I)",
  "viewer.trashShortcut": "Áthelyezés a kukába (Del)",
  "viewer.rename": "Kattints az átnevezéshez",
  "viewer.closeShortcut": "Bezárás (Esc)",
  "viewer.prev": "Előző (←)",
  "viewer.next": "Következő (→)",
  "viewer.name": "Név",
  "viewer.type": "Típus",
  "viewer.dimensions": "Méretek",
  "viewer.taken": "Készült",
  "viewer.added": "Hozzáadva",
  "viewer.modified": "Módosítva",
  "viewer.size": "Méret",
  "viewer.onServer": "Szerveren",
  "viewer.albums": "Albumok",
  "viewer.shared": "Megosztva",
  "viewer.sharedPublic": "Nyilvános link",
  "viewer.sharedPeople": "Személyekkel",
  "viewer.sharedNo": "Nem",
  "viewer.unverified": " (nem ellenőrzött)",
  "viewer.trashFailed": "nem sikerült a kukába helyezni",
  "viewer.zoomOut": "Kicsinyítés",
  "viewer.zoomIn": "Nagyítás",
  "viewer.resetFit": "Visszaállítás méretre",
  "viewer.videoLoading": "Videó betöltése…",
  "viewer.videoError": "Ez a videóformátum itt nem játszható le. Töltsd le a megtekintéshez.",
  "viewer.videoTooLarge": "Ez a videó túl nagy a lejátszáshoz. Töltsd le a megtekintéshez.",

  // Upload panel
  "upload.title": "Feltöltés",
  "upload.filterName": "Fotók és videók",
  "upload.dropHint": "Húzz fotókat vagy egy mappát bárhová az ablakban",
  "upload.dropSub":
    "A fotók egyből az idővonaladra kerülnek. A mappából azonos nevű album lesz.",
  "upload.chooseFiles": "Fájlok kiválasztása",
  "upload.chooseFolder": "Mappa kiválasztása",
  "upload.alreadyThere": "{count} már fent van",
  "upload.failedCount": "{count} sikertelen",
  "upload.clear": "Törlés",
  "upload.statusUploading": "feltöltés…",
  "upload.statusSkipped": "kihagyva",
  "upload.statusQueued": "sorban",
  "upload.statusFailed": "sikertelen",

  // Grid tile
  "grid.select": "Kijelölés",
  "grid.deselect": "Kijelölés megszüntetése",

  // Selection bar
  "selection.cancel": "Kijelölés megszüntetése (Esc)",
  "selection.count.one": "{count} fotó kijelölve",
  "selection.count.other": "{count} fotó kijelölve",
  "selection.trash": "Kuka",
  "selection.download": "Letöltés",
  "selection.freeUp": "Felszabadítás",
  "download.freedUp": "{count} felszabadítva",
  "download.notDownloaded": "Nincs mit felszabadítani",
  "download.running": "Letöltés…",
  "download.done": "{count} elérhető offline",
  "download.alreadyOffline": "Már elérhető offline",
  "download.partial": "{ok} elmentve, {failed} sikertelen",

  // Trash confirmation
  "confirm.trashTitle": "Áthelyezés a kukába?",
  "confirm.trashConfirm": "Áthelyezés a kukába",
  "confirm.trashCount.one":
    "{count} fotó a kukába kerül. A Proton Drive-ból visszaállíthatók.",
  "confirm.trashCount.other":
    "{count} fotó a kukába kerül. A Proton Drive-ból visszaállíthatók.",
  "confirm.trashName":
    'A(z) "{name}" a kukába kerül. A Proton Drive-ból visszaállítható.',
  "confirm.thisPhoto": "Ez a fotó",
};
