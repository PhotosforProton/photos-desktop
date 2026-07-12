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

// Slovak (sk) strings. Keys mirror en.ts exactly.
export const sk: Record<string, string> = {
  // Common
  "common.cancel": "Zrušiť",
  "common.close": "Zavrieť",
  "common.back": "Späť",
  "common.loading": "Načítava sa…",
  "common.photoCount.one": "{count} fotka",
  "common.photoCount.other": "{count} fotiek",

  // Navigation
  "nav.photos": "Fotky",
  "nav.albums": "Albumy",
  "nav.shared": "Zdieľané",

  // App shell
  "app.restoring": "Obnovuje sa relácia…",
  "update.available": "K dispozícii je aktualizácia {version}",
  "update.now": "Aktualizovať",
  "update.updating": "Aktualizuje sa…",
  "update.failed": "Aktualizácia zlyhala",
  "update.hashError": "Overenie stiahnutého súboru zlyhalo",
  "menu.reload": "Znova načítať",
  "menu.moreSoon": "Čoskoro viac…",
  "menu.quit": "Ukončiť",

  // Tray popup
  "tray.open": "Otvoriť Photos for Proton",
  "tray.syncNow": "Synchronizovať teraz",
  "tray.syncing": "Synchronizuje sa…",
  "tray.synced": "Aktuálne",

  // Login
  "login.subtitle": "Prihláste sa do svojho účtu Proton",
  "login.emailLabel": "E-mail alebo používateľské meno",
  "login.passwordLabel": "Heslo",
  "login.passwordPlaceholder": "Heslo",
  "login.signIn": "Prihlásiť sa",
  "login.signingIn": "Prihlasovanie…",
  "login.twofaLabel": "Dvojfaktorový kód",
  "login.verify": "Overiť",
  "login.verifying": "Overuje sa…",
  "login.captchaHint": "Proton vás žiada o potvrdenie, že ste človek.",
  "login.captchaExpired": "Platnosť testu captcha vypršala. Vyriešte ho znova.",

  // Lock screen (returning cold start)
  "lock.subtitle": "Zadajte heslo na odomknutie",
  "lock.unlock": "Odomknúť",
  "lock.unlocking": "Odomyká sa…",
  "lock.wrongPassword": "Nesprávne heslo",
  "lock.failed": "Nepodarilo sa odomknúť. Skúste to znova.",
  "lock.differentAccount": "Použiť iný účet",

  // Titlebar
  "titlebar.minimize": "Minimalizovať",
  "titlebar.maximize": "Maximalizovať",

  // Settings
  "settings.title": "Nastavenia",
  "settings.appearance": "Vzhľad",
  "settings.theme": "Motív",
  "settings.themeDesc": "Systém sa riadi Windowsom a mení sa spolu s ním.",
  "settings.theme.dark": "Tmavý",
  "settings.theme.light": "Svetlý",
  "settings.theme.system": "Systém",
  "settings.palette": "Paleta",
  "settings.paletteDesc": "Farba zvýraznenia použitá v celej aplikácii.",
  "settings.palette.default": "Predvolená",
  "settings.palette.forest": "Les",
  "settings.palette.sunset": "Západ slnka",
  "settings.palette.sea": "More",
  "settings.palette.sepia": "Sépia",
  "settings.palette.mono": "Mono",
  "settings.palette.amoled": "Čistá čierna (AMOLED)",
  "settings.language": "Jazyk",
  "settings.languageDesc": "Vyberte jazyk zobrazenia.",
  "settings.timeline": "Časová os",
  "settings.hideAlbum": "Skryť fotky v albumoch na Drive",
  "settings.hideAlbumDesc":
    "Fotky pridané do albumu na Drive sa nezobrazia vo vašej hlavnej časovej osi. Naďalej sa zobrazujú na kartách Albumy a Zdieľané a vo filtroch kategórií.",
  "settings.security": "Zabezpečenie",
  "settings.lockOnHide": "Vyžadovať heslo pri opätovnom otvorení zo systémovej lišty",
  "settings.debug": "Ladiaca vrstva",
  "settings.debugDesc": "Zobraziť živý prehľad pamäte (veľkosť haldy a vyrovnávacej pamäte).",
  "settings.explorer": "Prieskumník súborov",
  "settings.showInExplorer": "Zobraziť „Proton Photos“ v Prieskumníkovi súborov",
  "settings.showInExplorerDesc":
    "Pridá do bočného panela Prieskumníka položku Proton Photos s vašimi cloudovými fotkami. Prejaví sa po reštarte.",
  "settings.autoDownload": "Automaticky sťahovať nové fotky",
  "settings.autoDownloadDesc":
    "Keď sa do knižnice pridávajú nové fotky, automaticky sa v tomto zariadení uchová kópia.",
  "settings.restartNeeded": "Reštartujte, aby sa zmena prejavila.",
  "settings.restartNow": "Reštartovať teraz",
  "settings.lockOnHideDesc":
    "Keď sa okno zavrie do systémovej lišty, aplikácia sa uzamkne a pri ďalšom otvorení si vyžiada heslo.",

  // Profile menu
  "profile.storage": "Úložisko",
  "profile.used": "{size} použitých",
  "profile.total": "{size} celkovo",
  "profile.signOut": "Odhlásiť sa",

  // Avatar
  "avatar.uploading": "Nahráva sa",
  "avatar.syncing": "Synchronizuje sa",
  "avatar.account": "Účet a nastavenia",
  "avatar.showUploads": "Zobraziť nahrávania",

  // Photos view
  "photos.all": "Všetko",
  "photos.search": "Hľadať",
  "photos.searchPlaceholder": "Hľadať podľa názvu alebo typu súboru…",
  "photos.closeSearch": "Zavrieť vyhľadávanie",
  "photos.smaller": "Menšie",
  "photos.bigger": "Väčšie",
  "photos.indexing": "Indexuje sa {done}/{total}",
  "photos.uploadTitle": "Nahrať fotky alebo priečinok ako album",
  "photos.uploadingProgress": "Nahráva sa {progress}",
  "photos.noMatches": "Žiadne zhody",
  "photos.noPhotos": "Zatiaľ žiadne fotky",
  "photos.noPhotosSub": "Vaše fotky sa tu objavia po synchronizácii.",
  "photos.stillIndexing": "Indexovanie stále prebieha, objaví sa viac výsledkov.",
  "photos.loadingThumbnails": "Načítavajú sa náhľady…",
  "photos.dropTitle": "Pustite sem pre nahranie",
  "photos.dropSub": "Priečinok sa stane albumom s rovnakým názvom",
  "photos.offline": "Dostupné offline",

  // Search type filters
  "filter.images": "Obrázky",
  "filter.videos": "Videá",

  // Filter panel
  "filter.title": "Filter",
  "filter.categories": "Kategórie",
  "filter.type": "Typ",
  "filter.mediaAll": "Všetko",
  "filter.mediaPhotos": "Fotky",
  "filter.reset": "Obnoviť",

  // Categories
  "category.fav": "Obľúbené",
  "category.screen": "Snímky obrazovky",
  "category.video": "Videá",
  "category.live": "Živé fotky",
  "category.selfie": "Selfie",
  "category.portrait": "Portréty",
  "category.burst": "Sekvencie",
  "category.pano": "Panorámy",
  "category.raw": "RAW",

  // Albums
  "albums.backToAlbums": "Späť na albumy",
  "albums.untitled": "Album bez názvu",
  "albums.empty": "Tento album je prázdny",
  "albums.none": "Zatiaľ žiadne albumy",
  "albums.noneSub": "Vytvorte album presunutím priečinka na okno.",
  "albums.keepOffline": "Ponechať tento album v tomto zariadení",
  "albums.keptOffline": "Ponechané v tomto zariadení (kliknutím zrušíte)",

  // Shared
  "shared.byMe": "Zdieľané mnou",
  "shared.withMe": "Zdieľané so mnou",
  "shared.emptyByTitle": "Nič nezdieľate",
  "shared.emptyWithTitle": "Nič vám nebolo zdieľané",
  "shared.emptyBySub": "Fotky a albumy, ktoré zdieľate, sa objavia tu.",
  "shared.emptyWithSub": "Fotky a albumy, ktoré s vami zdieľajú ostatní, sa objavia tu.",
  "shared.publicLink": "Zdieľané cez verejný odkaz",
  "shared.album": "Album",

  // Photo viewer / lightbox
  "viewer.details": "Podrobnosti",
  "viewer.download": "Ponechať offline",
  "viewer.freeUp": "Uvoľniť miesto",
  "viewer.detailsShortcut": "Podrobnosti (I)",
  "viewer.trashShortcut": "Presunúť do koša (Del)",
  "viewer.rename": "Kliknutím premenujete",
  "viewer.closeShortcut": "Zavrieť (Esc)",
  "viewer.prev": "Predchádzajúca (←)",
  "viewer.next": "Ďalšia (→)",
  "viewer.name": "Názov",
  "viewer.type": "Typ",
  "viewer.dimensions": "Rozmery",
  "viewer.taken": "Nasnímané",
  "viewer.added": "Pridané",
  "viewer.modified": "Upravené",
  "viewer.size": "Veľkosť",
  "viewer.onServer": "Na serveri",
  "viewer.albums": "Albumy",
  "viewer.shared": "Zdieľané",
  "viewer.sharedPublic": "Verejný odkaz",
  "viewer.sharedPeople": "S ľuďmi",
  "viewer.sharedNo": "Nie",
  "viewer.unverified": " (neoverené)",
  "viewer.trashFailed": "nepodarilo sa presunúť do koša",
  "viewer.zoomOut": "Oddialiť",
  "viewer.zoomIn": "Priblížiť",
  "viewer.resetFit": "Prispôsobiť veľkosti",
  "viewer.videoLoading": "Načítava sa video…",
  "viewer.videoError": "Tento formát videa sa tu nedá prehrať. Stiahnite ho na prehratie.",
  "viewer.videoTooLarge": "Toto video je príliš veľké na prehratie tu. Stiahnite ho na prehratie.",

  // Upload panel
  "upload.title": "Nahrať",
  "upload.filterName": "Fotky a videá",
  "upload.dropHint": "Presuňte fotky alebo priečinok kamkoľvek na okno",
  "upload.dropSub":
    "Fotky idú rovno do vašej časovej osi. Priečinok sa stane albumom s rovnakým názvom.",
  "upload.chooseFiles": "Vybrať súbory",
  "upload.chooseFolder": "Vybrať priečinok",
  "upload.alreadyThere": "{count} už existuje",
  "upload.failedCount": "{count} zlyhalo",
  "upload.clear": "Vymazať",
  "upload.statusUploading": "nahráva sa…",
  "upload.statusSkipped": "preskočené",
  "upload.statusQueued": "v poradí",
  "upload.statusFailed": "zlyhalo",

  // Grid tile
  "grid.select": "Vybrať",
  "grid.deselect": "Zrušiť výber",

  // Selection bar
  "selection.cancel": "Zrušiť výber (Esc)",
  "selection.count.one": "Vybraná {count} fotka",
  "selection.count.other": "Vybraných {count} fotiek",
  "selection.trash": "Do koša",
  "selection.download": "Stiahnuť",
  "selection.freeUp": "Uvoľniť",
  "download.freedUp": "Uvoľnené: {count}",
  "download.notDownloaded": "Nie je nič stiahnuté na uvoľnenie",
  "download.running": "Sťahuje sa…",
  "download.done": "Ponechané offline: {count}",
  "download.alreadyOffline": "Už dostupné offline",
  "download.partial": "Uložené {ok}, zlyhalo {failed}",

  // Trash confirmation
  "confirm.trashTitle": "Presunúť do koša?",
  "confirm.trashConfirm": "Presunúť do koša",
  "confirm.trashCount.one":
    "{count} fotka sa presunie do koša. Môžete ju obnoviť z Proton Drive.",
  "confirm.trashCount.other":
    "{count} fotiek sa presunie do koša. Môžete ich obnoviť z Proton Drive.",
  "confirm.trashName":
    '„{name}“ sa presunie do koša. Môžete ju obnoviť z Proton Drive.',
  "confirm.thisPhoto": "Táto fotka",
};
