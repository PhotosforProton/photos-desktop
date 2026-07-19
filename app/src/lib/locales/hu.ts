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
  "nav.trash": "Kuka",

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
  "tray.locked": "Zárolva",
  "tray.lockedHint": "Nyisd meg a feloldáshoz",
  "tray.signedOut": "Nincs bejelentkezve",
  "tray.signedOutHint": "Nyisd meg a belépéshez",

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
  "settings.general": "Általános",
  "settings.launchAtLogin": "Indítás a Windowsszal",
  "settings.launchAtLoginDesc": "A Windowsba való bejelentkezéskor a háttérben indul, és csak a tálcaikon látszik, amíg meg nem nyitod.",
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
    "Ahogy új fotók kerülnek a könyvtáradba, automatikusan letöltődnek a Proton Photos mappába.",
  "settings.autoDownloadNeedsExplorer":
    "Csak akkor működik, ha a „Proton Photos” megjelenik a Fájlkezelőben, ez viszont ki van kapcsolva. A letöltés így is elérhető: megkérdezi, hova mentse a fotókat.",
  "settings.restartNeeded": "Újraindítás szükséges a módosításhoz.",
  "settings.restartNow": "Újraindítás most",
  // File types. The "Open with" entries are the app's own to add and take back out;
  // the default handler is not, so that half leads out to Windows rather than
  // pretending to a choice Windows takes from the user alone.
  "settings.fileTypes": "Fájltípusok",
  "settings.openWith": "Felvétel a „Megnyitás ezzel” listára",
  "settings.openWithDesc":
    "A Photos for Proton megjelenik a Windows „Megnyitás ezzel” menüjében a JPEG, PNG, GIF, WebP, AVIF, BMP, TIFF és HEIC fotóknál, valamint az MP4, MOV, M4V és WebM videóknál. Kikapcsolva a bejegyzések lekerülnek.",
  "settings.fileTypesFailed": "A fájltípusok módosítása nem sikerült. Próbáld újra.",
  "settings.defaultApp": "Fotók és videók alapértelmezett alkalmazása",
  "settings.defaultAppDesc":
    "Ettől semmi nem lesz alapértelmezett: ezt a választást a Windows csak tőled fogadja el, programtól soha. A Windows beállításaiban, az Alapértelmezett alkalmazások alatt válaszd ki a Photos for Proton alkalmazást.",
  "settings.defaultAppOpen": "Windows beállítások megnyitása",
  "settings.defaultAppFailed": "A Windows beállítások megnyitása nem sikerült. Próbáld újra.",
  "settings.lockOnHideDesc":
    "Amikor az ablak a tálcára kerül, az alkalmazás zárolttá válik, és legközelebb a jelszavaddal nyithatod meg.",
  "settings.storage": "Tárhely",
  // Two different places a photo can be kept on this machine: encrypted inside the
  // app, or downloaded into the Proton Photos folder where Windows can read it. The
  // panel names both rather than adding one number to the other.
  "settings.downloadedCount.one": "{count} fotó letöltve",
  "settings.downloadedCount.other": "{count} fotó letöltve",
  "settings.downloadedNone": "Nincs letöltött fotó",
  "settings.downloadedDesc":
    "A letöltött fotók közönséges fájlok a Proton Photos mappában, így a Windows kereső és más programok is olvashatják őket. A felszabadítás csak ezeket a helyi másolatokat törli, a fotóid a Protonon maradnak.",
  "settings.freeUpAll": "{size} felszabadítása",
  "settings.freeUpNothing": "Nincs mit felszabadítani",
  "settings.freeingUp": "Felszabadítás…",
  "settings.storageOffline": "Offline fotók",
  "settings.storageExplorer": "A Fájlkezelőben",
  "settings.offlineCount.one": "{count} fotó van az alkalmazásban",
  "settings.offlineCount.other": "{count} fotó van az alkalmazásban",
  "settings.offlineNone": "Nincs fotó az alkalmazásban",
  "settings.offlineDesc":
    "Az offline elérhetőnek jelölt fotók titkosítva maradnak az alkalmazáson belül. Internet nélkül is megnyithatók, és soha nem jelennek meg a Proton Photos mappában, így az alkalmazáson kívül semmi nem tudja elolvasni őket.",
  "settings.offlineSaving": "Mentés {done}/{total}…",
  "settings.offlineRemoveAll": "{size} felszabadítása",
  "settings.offlineRemoveNothing": "Nincs mit felszabadítani",
  "settings.offlineRemoving": "Eltávolítás…",
  "settings.freeUpFailed": "A hely felszabadítása nem sikerült. Próbáld újra.",

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
  "photos.offline": "Elérhető offline, titkosítva az alkalmazásban",
  "photos.downloaded": "Letöltve a Proton Photos mappába",
  "photos.renameTitle": "Fotó átnevezése",
  "photos.namePlaceholder": "Fájlnév",

  // Tile badges
  "badge.motionPhoto": "Mozgó fotó",
  "badge.panorama": "Panoráma",
  "badge.raw": "RAW",
  "badge.favorite": "Kedvenc",

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
  "albums.noneSub": "Hozz létre egyet itt, vagy húzz egy mappát az ablakra.",
  "albums.keepDownloaded": "Album letöltése a Proton Photos mappába",
  "albums.keptDownloaded": "Letöltés a Proton Photos mappába (kattints a leállításhoz)",
  "albums.freeUpTitle": "Felszabadítod az album tárhelyét?",
  "albums.freeUpCount.one":
    "Az album már nem tölti le magát. Az eddig letöltött {count} fotó maradhat a Proton Photos mappában, vagy felszabadíthatod a helyét. Mindkét esetben a Protonon marad.",
  "albums.freeUpCount.other":
    "Az album már nem tölti le magát. Az eddig letöltött {count} fotó maradhat a Proton Photos mappában, vagy felszabadíthatod a helyüket. Mindkét esetben a Protonon maradnak.",
  "albums.freeUpKeep": "Maradjon letöltve",
  "albums.freeUpConfirm": "Felszabadítás",
  "albums.newAlbum": "Új album",
  "albums.newTitle": "Nevezd el az albumot",
  "albums.namePlaceholder": "Album neve",
  "albums.create": "Létrehozás",
  "albums.createAndAdd": "Létrehozás és hozzáadás",
  "albums.rename": "Átnevezés",
  "albums.renameTitle": "Album átnevezése",
  "albums.share": "Album megosztása",
  "albums.delete": "Album törlése",
  "albums.deleted": "Album törölve",
  "albums.addTitle": "Hozzáadás albumhoz",
  "albums.addCount.one": "Válaszd ki, hová kerüljön {count} fotó.",
  "albums.addCount.other": "Válaszd ki, hová kerüljön {count} fotó.",
  "albums.added": "{count} hozzáadva",
  "albums.addPartial": "{ok} hozzáadva, {failed} sikertelen",
  "albums.removed": "{count} eltávolítva az albumból",
  "albums.removePartial": "{ok} eltávolítva, {failed} sikertelen",
  "albums.coverSet": "Borító frissítve",
  "albums.strandedTitle.one": "{count} fotó csak ebben az albumban van meg",
  "albums.strandedTitle.other": "{count} fotó csak ebben az albumban van meg",
  "albums.strandedMsg.one":
    "Nincs rajta az idővonaladon, így az album törlésével együtt törlődik. Mentsd az idővonaladra, ha meg akarod tartani.",
  "albums.strandedMsg.other":
    "Nincsenek rajta az idővonaladon, így az album törlésével együtt törlődnek. Mentsd őket az idővonaladra, ha meg akarod tartani őket.",
  "albums.savePhotos": "Mentés az idővonalra",
  "albums.deletePhotosToo": "Fotók törlése is",

  // Shared
  "shared.byMe": "Általam megosztott",
  "shared.withMe": "Velem megosztott",
  "shared.flip": "Váltás az általam és a velem megosztottak között",
  "shared.emptyByTitle": "Nem osztasz meg semmit",
  "shared.emptyWithTitle": "Nincs veled megosztva semmi",
  "shared.emptyBySub": "Az általad megosztott fotók és albumok itt jelennek meg.",
  "shared.emptyWithSub": "A veled megosztott fotók és albumok itt jelennek meg.",
  "shared.publicLink": "Megosztva nyilvános linkkel",
  "shared.album": "Album",
  "shared.manage": "Megosztás kezelése",
  "shared.back": "Vissza a megosztásokhoz",

  // Share dialog. A public link's URL carries the secret that decrypts what it
  // points at, so copying it whole is the whole point of the link section. A
  // link's password is never read back, so the dialog reports whether one is set
  // rather than showing it.
  "share.title": "Megosztás",
  "share.linkTitle": "Nyilvános link",
  "share.linkDesc": "A linkkel bárki megnyithatja ezt a fotót.",
  "share.createLink": "Link létrehozása",
  "share.copyLink": "Link másolása",
  "share.copied": "Másolva",
  "share.removeLink": "Link eltávolítása",
  "share.passwordLabel": "Jelszó",
  "share.passwordSet": "Megnyitáshoz szükséges",
  "share.passwordNone": "Nincs beállítva",
  "share.passwordPlaceholder": "Új jelszó",
  "share.expiryLabel": "Lejárat",
  "share.expiryNever": "Soha",
  "share.expiryPast": "Válassz jövőbeli dátumot.",
  "share.add": "Hozzáadás",
  "share.change": "Módosítás",
  "share.set": "Beállítás",
  "share.save": "Mentés",
  "share.albumInviteOnly": "Az albumok meghívóval oszthatók meg, nem nyilvános linkkel.",
  "share.peopleTitle": "Emberek",
  "share.emailPlaceholder": "E-mail-cím",
  "share.invite": "Meghívás",
  "share.roleViewer": "Megtekintő",
  "share.roleEditor": "Szerkesztő",
  "share.stateInvited": "Meghívva",
  "share.stateExternal": "Meghívva (nincs Proton-fiók)",
  "share.remove": "Eltávolítás",
  "share.noPeople": "Még senki",
  "share.stopSharing": "Megosztás leállítása",
  "share.notOwned":
    "Ezt veled osztották meg. Csak a tulajdonosa módosíthatja, hogy ki férhet hozzá.",
  "share.badEmail": "Ez nem tűnik e-mail-címnek.",
  "share.copyFailed": "A link másolása nem sikerült",
  "share.failed": "A megosztás módosítása nem sikerült",
  "share.working": "Folyamatban…",

  // Trash
  "trash.emptyTitle": "A kuka üres",
  "trash.emptySub": "Ide kerülnek a kukába helyezett fotók, és innen vissza is állíthatók.",
  "trash.emptyAction": "Kuka ürítése",
  "trash.moved": "{count} áthelyezve a kukába",
  "trash.movedPartial": "{ok} áthelyezve a kukába, {failed} sikertelen",
  "trash.restored": "{count} visszaállítva",
  "trash.deleted": "{count} véglegesen törölve",
  "trash.emptied": "A kuka kiürítve",
  "trash.partial": "{ok} kész, {failed} sikertelen",

  // Photo viewer / lightbox
  "viewer.details": "Részletek",
  "viewer.offlineAdd": "Offline másolat megtartása, titkosítva az alkalmazásban",
  "viewer.offlineRemove": "Offline másolat eltávolítása",
  "viewer.download": "Letöltés a Proton Photos mappába",
  "viewer.saveToFolder": "Másolat mentése tetszőleges helyre",
  "viewer.freeUp": "A helyi másolat eltávolítása helyfelszabadításhoz",
  "viewer.detailsShortcut": "Részletek (I)",
  "viewer.contents": "Tartalom",
  "viewer.contentsShortcut": "Tartalom (L)",
  "viewer.filmstrip": "Szomszédos elemek",
  "viewer.position": "{n} / {total}",
  "viewer.favoriteShortcut": "Hozzáadás a kedvencekhez (F)",
  "viewer.unfavoriteShortcut": "Eltávolítás a kedvencekből (F)",
  "viewer.trashShortcut": "Áthelyezés a kukába (Del)",
  "viewer.shareShortcut": "Megosztás (S)",
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
  "viewer.onServer": "Felhasznált tárhely",
  "viewer.albums": "Albumok",
  "viewer.shared": "Megosztva",
  "viewer.sharedPublic": "Nyilvános link",
  "viewer.sharedPeople": "Személyekkel",
  "viewer.sharedNo": "Nem",
  "viewer.unverified": " (nem ellenőrzött)",
  "viewer.trashFailed": "Ezt a fotót nem sikerült a kukába helyezni.",
  "viewer.favoriteFailed": "A kedvenceket nem sikerült frissíteni.",
  "viewer.downloadFailed": "Ezt a fotót nem sikerült letölteni.",
  "viewer.zoomOut": "Kicsinyítés",
  "viewer.zoomIn": "Nagyítás",
  "viewer.resetFit": "Visszaállítás méretre",
  "viewer.videoLoading": "Videó betöltése…",
  "viewer.videoError":
    "Ez a videóformátum itt nem játszható le. Töltsd le, és nézd meg egy másik lejátszóban.",
  "viewer.videoTooLarge":
    "Ez a videó túl nagy ahhoz, hogy itt lejátszható legyen. Töltsd le, és nézd meg egy másik lejátszóban.",

  // The viewer's own video controls, which stand in for the browser's.
  "viewer.videoPlay": "Lejátszás (szóköz)",
  "viewer.videoPause": "Szünet (szóköz)",
  "viewer.videoStepBack": "Előző képkocka",
  "viewer.videoStepForward": "Következő képkocka",
  "viewer.videoSeek": "Lejátszási pozíció",
  "viewer.videoMute": "Némítás",
  "viewer.videoUnmute": "Némítás feloldása",

  // Local file viewer: a file opened from File Explorer, which the app can show
  // with nobody signed in. Everything both viewers say alike comes from above.
  "local.camera": "Fényképezőgép",
  "local.created": "Létrehozva",
  "local.path": "Hely",
  "local.upload": "Feltöltés a Protonra",
  "local.uploadUnsupported": "A Proton nem fogadja el ezt a fájltípust",
  "local.uploading": "Feltöltés…",
  "local.uploaded": "Mentve a Protonra",
  "local.uploadSkipped": "Már mentve van",
  "local.uploadFailed": "A feltöltés nem sikerült. Próbáld újra.",
  "local.delete": "Törlés",
  "local.deleteTitle": "Törlöd ezt a fájlt?",
  "local.deleteMessage": "A(z) „{name}” a lomtárba kerül.",
  "local.notFound": "Ezt a fájlt áthelyezték vagy törölték.",
  "local.unreadable":
    "Ezt a fájlt nem lehet olvasni. Lehet, hogy egy másik program nyitva tartja, vagy ez a fiók nem fér hozzá.",
  "local.openFailed": "Ezt a fájlt nem lehet megnyitni.",
  "local.decodeFailed": "Ezt a fotót nem lehet beolvasni. Lehet, hogy a fájl sérült vagy hiányos.",
  "local.videoUnsupported":
    "Ez a videóformátum itt nem játszható le. Nyisd meg egy másik lejátszóban.",
  "local.noCodec":
    "A Windowsnak nincs dekódolója ehhez a formátumhoz, ezért itt nem jeleníthető meg. A Microsoft Store-ban néhányhoz megtalálható a hiányzó rész: a HEIC-fotókhoz a HEIF- és HEVC-bővítmény, a nyers fényképezőgépes fájlokhoz pedig a Raw Image Extension.",
  "local.signInTitle": "Belépés a feltöltéshez",
  "local.signInBody":
    "Megnyílik az alkalmazás ablaka, ahol be tudsz lépni. Ez a fájl itt nyitva marad.",
  "local.signInAction": "Belépés",

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
  "selection.restore": "Visszaállítás",
  "selection.deleteForever": "Végleges törlés",
  "selection.more": "Több",
  "selection.download": "Letöltés",
  "selection.freeUp": "Felszabadítás",
  "selection.addToAlbum": "Hozzáadás albumhoz",
  "selection.removeFromAlbum": "Eltávolítás az albumból",
  "selection.setCover": "Beállítás borítóként",
  "selection.rename": "Átnevezés",
  "selection.share": "Megosztás",
  "selection.favorite": "Hozzáadás a kedvencekhez",
  "selection.unfavorite": "Eltávolítás a kedvencekből",
  "selection.offlineAdd": "Elérhető offline",
  "selection.offlineRemove": "Offline másolat eltávolítása",
  // Download: the copy that lands in the Proton Photos folder, where Windows and any
  // other program can read it. Never called offline, which is the app's own copy.
  "download.freedUp": "{count} felszabadítva",
  "download.freedUpNone": "Semmi sem szabadult fel",
  "download.notDownloaded": "Nincs mit felszabadítani",
  "download.running": "Letöltés…",
  "download.progress": "Letöltés {done}/{total}…",
  "download.done": "{count} letöltve a Proton Photos mappába",
  "download.donePartial": "{ok} / {total} letöltve",
  "download.doneNone":
    "Semmi sem lett letöltve. Lehet, hogy a Proton Photos mappa még nem áll készen.",
  "download.alreadyDownloaded": "Már letöltve",
  "download.saved": "{count} elmentve a mappába",
  "download.partial": "{ok} elmentve, {failed} sikertelen",

  // Available offline: the app's own encrypted copy, which is not the Proton Photos
  // folder. These say where the copy went, so the two are never mistaken for one another.
  "offline.added.one": "{count} fotó mentése offline használatra",
  "offline.added.other": "{count} fotó mentése offline használatra",
  "offline.removed.one": "{count} offline másolat eltávolítva",
  "offline.removed.other": "{count} offline másolat eltávolítva",
  "offline.alreadyOffline": "Már elérhető offline",
  "offline.noneOffline": "Nincs eltávolítható offline másolat",
  "offline.failed": "nem sikerült offline használatra menteni",

  // Trash confirmation
  "confirm.trashTitle": "Áthelyezés a kukába?",
  "confirm.trashConfirm": "Áthelyezés a kukába",
  "confirm.trashCount.one":
    "{count} fotó a kukába kerül. A Kuka fülön visszaállítható.",
  "confirm.trashCount.other":
    "{count} fotó a kukába kerül. A Kuka fülön visszaállíthatók.",
  "confirm.trashName":
    'A(z) "{name}" a kukába kerül. A Kuka fülön visszaállítható.',
  "confirm.thisPhoto": "Ez a fotó",

  // Remove from album. The photos stay in Photos; only the album loses them.
  "confirm.removeTitle": "Eltávolítod az albumból?",
  "confirm.removeConfirm": "Eltávolítás",
  "confirm.removeCount.one": "{count} fotó kikerül ebből az albumból, de az idővonaladon marad.",
  "confirm.removeCount.other": "{count} fotó kikerül ebből az albumból, de az idővonaladon marad.",

  // Delete-forever confirmation. Nothing in the app or at Proton undoes these.
  "confirm.deleteTitle": "Végleges törlés?",
  "confirm.deleteConfirm": "Végleges törlés",
  "confirm.deleteCount.one":
    "{count} fotó véglegesen törlődik a Protonról. Ez nem vonható vissza.",
  "confirm.deleteCount.other":
    "{count} fotó véglegesen törlődik a Protonról. Ez nem vonható vissza.",
  "confirm.emptyTitle": "Kiüríted a kukát?",
  "confirm.emptyConfirm": "Minden törlése",
  "confirm.emptyMessage":
    "A kuka teljes tartalma véglegesen törlődik a Protonról. Ez nem vonható vissza.",

  // Deleting an album skips the trash, so the album is gone for good even though
  // the photos in your timeline are not.
  "confirm.deleteAlbumTitle": "Törlöd ezt az albumot?",
  "confirm.deleteAlbumMessage":
    "Az album törlődik, és nem állítható vissza. Az idővonaladon lévő fotók megmaradnak.",

  // Revoking sharing takes access away from people who may already hold the link,
  // and nothing is deleted by it, so both of these say exactly what is lost.
  "confirm.removeLinkTitle": "Eltávolítod a linket?",
  "confirm.removeLinkMessage":
    "A link mindenkinél megszűnik működni, akinél megvan. Az e-mailben meghívottak hozzáférése megmarad.",
  "confirm.removeLinkConfirm": "Link eltávolítása",
  "confirm.replaceLinkTitle": "Lecseréled a linket?",
  "confirm.replaceLinkMessage":
    "Ez a link túl régi ahhoz, hogy módosítható legyen, ezért a mentés egy új, másik címen lévő linkre cseréli. A régi link mindenkinél megszűnik működni, akinél megvan, és a jelszava is törlődik. Az új link a vágólapra kerül.",
  "confirm.replaceLinkConfirm": "Link lecserélése",
  "confirm.stopSharingTitle": "Leállítod a megosztást?",
  "confirm.stopSharingMessage":
    "A link megszűnik működni, és minden meghívott elveszíti a hozzáférését. Semmi nem törlődik.",
  "confirm.stopSharingConfirm": "Megosztás leállítása",

  // Freeing up drops the downloaded copies only. Nothing leaves Proton, so this asks
  // before a big change without treating it as one there is no way back from.
  "confirm.freeUpAllTitle": "Felszabadítod az összes letöltött fotót?",
  "confirm.freeUpAllMessage":
    "A Proton Photos mappában lévő {size} törlődik. A fotóid a Protonon maradnak, és amikor megnyitod őket, újra letöltődnek.",
  "confirm.freeUpAllConfirm": "Felszabadítás",

  // Removing every offline copy. The photos themselves are untouched, so this warns
  // about the download they will need next time and nothing more.
  "confirm.removeOfflineAllTitle": "Eltávolítod az összes offline másolatot?",
  "confirm.removeOfflineAllMessage":
    "Az alkalmazásban titkosítva tárolt {size} törlődik. A fotóid a Protonon maradnak, de a megnyitásukhoz újra internet kell.",
  "confirm.removeOfflineAllConfirm": "Eltávolítás",
};
