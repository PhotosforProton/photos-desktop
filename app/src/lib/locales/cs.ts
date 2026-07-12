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

// Czech (cs) strings. Keys mirror en.ts exactly.
export const cs: Record<string, string> = {
  // Common
  "common.cancel": "Zrušit",
  "common.close": "Zavřít",
  "common.back": "Zpět",
  "common.loading": "Načítání…",
  "common.photoCount.one": "{count} fotka",
  "common.photoCount.other": "{count} fotek",

  // Navigation
  "nav.photos": "Fotky",
  "nav.albums": "Alba",
  "nav.shared": "Sdílené",

  // App shell
  "app.restoring": "Obnovování relace…",
  "update.available": "Je dostupná aktualizace {version}",
  "update.now": "Aktualizovat",
  "update.updating": "Aktualizace…",
  "update.failed": "Aktualizace selhala",
  "update.hashError": "Stažený soubor neprošel ověřením",
  "menu.reload": "Znovu načíst",
  "menu.moreSoon": "Brzy více…",
  "menu.quit": "Ukončit",

  // Tray popup
  "tray.open": "Otevřít Photos for Proton",
  "tray.syncNow": "Synchronizovat nyní",
  "tray.syncing": "Synchronizace…",
  "tray.synced": "Aktuální",

  // Login
  "login.subtitle": "Přihlas se ke svému účtu Proton",
  "login.emailLabel": "E-mail nebo uživatelské jméno",
  "login.passwordLabel": "Heslo",
  "login.passwordPlaceholder": "Heslo",
  "login.signIn": "Přihlásit se",
  "login.signingIn": "Přihlašování…",
  "login.twofaLabel": "Dvoufaktorový kód",
  "login.verify": "Ověřit",
  "login.verifying": "Ověřování…",
  "login.captchaHint": "Proton tě žádá o potvrzení, že jsi člověk.",
  "login.captchaExpired": "Platnost captcha vypršela. Vyřeš ji prosím znovu.",

  // Lock screen (returning cold start)
  "lock.subtitle": "Zadej své heslo pro odemknutí",
  "lock.unlock": "Odemknout",
  "lock.unlocking": "Odemykání…",
  "lock.wrongPassword": "Nesprávné heslo",
  "lock.failed": "Nepodařilo se odemknout. Zkus to prosím znovu.",
  "lock.differentAccount": "Použít jiný účet",

  // Titlebar
  "titlebar.minimize": "Minimalizovat",
  "titlebar.maximize": "Maximalizovat",

  // Settings
  "settings.title": "Nastavení",
  "settings.appearance": "Vzhled",
  "settings.theme": "Motiv",
  "settings.themeDesc": "Systém se řídí Windows a průběžně se přizpůsobuje jeho změnám.",
  "settings.theme.dark": "Tmavý",
  "settings.theme.light": "Světlý",
  "settings.theme.system": "Systém",
  "settings.palette": "Paleta",
  "settings.paletteDesc": "Barevný akcent používaný v celé aplikaci.",
  "settings.palette.default": "Výchozí",
  "settings.palette.forest": "Les",
  "settings.palette.sunset": "Západ slunce",
  "settings.palette.sea": "Moře",
  "settings.palette.sepia": "Sépie",
  "settings.palette.mono": "Mono",
  "settings.palette.amoled": "Čistá černá (AMOLED)",
  "settings.language": "Jazyk",
  "settings.languageDesc": "Zvol jazyk zobrazení.",
  "settings.timeline": "Časová osa",
  "settings.hideAlbum": "Skrýt fotky v albech na Drive",
  "settings.hideAlbumDesc":
    "Fotky přidané do alba na Drive se neobjeví na tvé hlavní časové ose. Stále se zobrazují v záložkách Alba a Sdílené a ve filtrech kategorií.",
  "settings.security": "Zabezpečení",
  "settings.lockOnHide": "Vyžadovat heslo při opětovném otevření z oznamovací oblasti",
  "settings.debug": "Ladicí překryv",
  "settings.debugDesc": "Zobrazit živý přehled paměti (velikost haldy a mezipaměti).",
  "settings.explorer": "Průzkumník souborů",
  "settings.showInExplorer": 'Zobrazit "Proton Photos" v Průzkumníku souborů',
  "settings.showInExplorerDesc":
    "Přidá do postranního panelu Průzkumníka položku Proton Photos s tvými cloudovými fotkami. Projeví se po restartu.",
  "settings.autoDownload": "Automaticky stahovat nové fotky",
  "settings.autoDownloadDesc":
    "Jakmile se do tvé knihovny přidají nové fotky, automaticky se v tomto zařízení ponechá jejich kopie.",
  "settings.restartNeeded": "Restartuj, aby se změna projevila.",
  "settings.restartNow": "Restartovat nyní",
  "settings.lockOnHideDesc":
    "Když se okno zavře do oznamovací oblasti, aplikace se zamkne a při příštím otevření tě požádá o heslo.",

  // Profile menu
  "profile.storage": "Úložiště",
  "profile.used": "{size} využito",
  "profile.total": "{size} celkem",
  "profile.signOut": "Odhlásit se",

  // Avatar
  "avatar.uploading": "Nahrávání",
  "avatar.syncing": "Synchronizace",
  "avatar.account": "Účet a nastavení",
  "avatar.showUploads": "Zobrazit nahrávání",

  // Photos view
  "photos.all": "Vše",
  "photos.search": "Hledat",
  "photos.searchPlaceholder": "Hledat podle názvu nebo typu souboru…",
  "photos.closeSearch": "Zavřít hledání",
  "photos.smaller": "Menší",
  "photos.bigger": "Větší",
  "photos.indexing": "Indexování {done}/{total}",
  "photos.uploadTitle": "Nahrát fotky nebo složku jako album",
  "photos.uploadingProgress": "Nahrávání {progress}",
  "photos.noMatches": "Žádné shody",
  "photos.noPhotos": "Zatím žádné fotky",
  "photos.noPhotosSub": "Tvé fotky se zde objeví po synchronizaci.",
  "photos.stillIndexing": "Indexování stále probíhá, další výsledky se objeví.",
  "photos.loadingThumbnails": "Načítání náhledů…",
  "photos.dropTitle": "Přetáhni sem pro nahrání",
  "photos.dropSub": "Ze složky vznikne album se stejným názvem",
  "photos.offline": "Dostupné offline",

  // Search type filters
  "filter.images": "Obrázky",
  "filter.videos": "Videa",

  // Filter panel
  "filter.title": "Filtr",
  "filter.categories": "Kategorie",
  "filter.type": "Typ",
  "filter.mediaAll": "Vše",
  "filter.mediaPhotos": "Fotky",
  "filter.reset": "Resetovat",

  // Categories
  "category.fav": "Oblíbené",
  "category.screen": "Snímky obrazovky",
  "category.video": "Videa",
  "category.live": "Živé fotky",
  "category.selfie": "Selfie",
  "category.portrait": "Portréty",
  "category.burst": "Sériové snímky",
  "category.pano": "Panoramata",
  "category.raw": "RAW",

  // Albums
  "albums.backToAlbums": "Zpět na alba",
  "albums.untitled": "Album bez názvu",
  "albums.empty": "Toto album je prázdné",
  "albums.none": "Zatím žádná alba",
  "albums.noneSub": "Vytvoř ho přetažením složky do okna.",
  "albums.keepOffline": "Ponechat toto album v tomto zařízení",
  "albums.keptOffline": "Ponecháno v tomto zařízení (kliknutím ukončíš)",

  // Shared
  "shared.byMe": "Sdílené mnou",
  "shared.withMe": "Sdílené se mnou",
  "shared.emptyByTitle": "Nic nesdílíš",
  "shared.emptyWithTitle": "S tebou není nic sdíleno",
  "shared.emptyBySub": "Fotky a alba, která sdílíš, se zobrazí zde.",
  "shared.emptyWithSub": "Fotky a alba, která s tebou sdílejí ostatní, se zobrazí zde.",
  "shared.publicLink": "Sdíleno veřejným odkazem",
  "shared.album": "Album",

  // Photo viewer / lightbox
  "viewer.details": "Podrobnosti",
  "viewer.download": "Ponechat offline",
  "viewer.freeUp": "Uvolnit místo",
  "viewer.detailsShortcut": "Podrobnosti (I)",
  "viewer.trashShortcut": "Přesunout do koše (Del)",
  "viewer.rename": "Kliknutím přejmenuješ",
  "viewer.closeShortcut": "Zavřít (Esc)",
  "viewer.prev": "Předchozí (←)",
  "viewer.next": "Další (→)",
  "viewer.name": "Název",
  "viewer.type": "Typ",
  "viewer.dimensions": "Rozměry",
  "viewer.taken": "Pořízeno",
  "viewer.added": "Přidáno",
  "viewer.modified": "Změněno",
  "viewer.size": "Velikost",
  "viewer.onServer": "Na serveru",
  "viewer.albums": "Alba",
  "viewer.shared": "Sdílené",
  "viewer.sharedPublic": "Veřejný odkaz",
  "viewer.sharedPeople": "S lidmi",
  "viewer.sharedNo": "Ne",
  "viewer.unverified": " (neověřeno)",
  "viewer.trashFailed": "nepodařilo se přesunout do koše",
  "viewer.zoomOut": "Oddálit",
  "viewer.zoomIn": "Přiblížit",
  "viewer.resetFit": "Přizpůsobit velikosti",
  "viewer.videoLoading": "Načítání videa…",
  "viewer.videoError": "Tento formát videa zde nelze přehrát. Stáhni jej pro přehrání.",
  "viewer.videoTooLarge": "Toto video je příliš velké pro přehrání zde. Stáhni jej pro přehrání.",

  // Upload panel
  "upload.title": "Nahrát",
  "upload.filterName": "Fotky a videa",
  "upload.dropHint": "Přetáhni fotky nebo složku kamkoli do okna",
  "upload.dropSub":
    "Fotky jdou rovnou na tvou časovou osu. Ze složky vznikne album se stejným názvem.",
  "upload.chooseFiles": "Vybrat soubory",
  "upload.chooseFolder": "Vybrat složku",
  "upload.alreadyThere": "{count} již nahráno",
  "upload.failedCount": "{count} selhalo",
  "upload.clear": "Vymazat",
  "upload.statusUploading": "nahrávání…",
  "upload.statusSkipped": "přeskočeno",
  "upload.statusQueued": "ve frontě",
  "upload.statusFailed": "selhalo",

  // Grid tile
  "grid.select": "Vybrat",
  "grid.deselect": "Zrušit výběr",

  // Selection bar
  "selection.cancel": "Zrušit výběr (Esc)",
  "selection.count.one": "{count} fotka vybrána",
  "selection.count.other": "{count} fotek vybráno",
  "selection.trash": "Do koše",
  "selection.download": "Stáhnout",
  "selection.freeUp": "Uvolnit",
  "download.freedUp": "{count} uvolněno",
  "download.notDownloaded": "Není co uvolnit",
  "download.running": "Stahování…",
  "download.done": "{count} ponecháno offline",
  "download.alreadyOffline": "Již dostupné offline",
  "download.partial": "Uloženo {ok}, {failed} selhalo",

  // Trash confirmation
  "confirm.trashTitle": "Přesunout do koše?",
  "confirm.trashConfirm": "Přesunout do koše",
  "confirm.trashCount.one":
    "{count} fotka se přesune do koše. Můžeš ji obnovit z Proton Drive.",
  "confirm.trashCount.other":
    "{count} fotek se přesune do koše. Můžeš je obnovit z Proton Drive.",
  "confirm.trashName":
    '"{name}" se přesune do koše. Můžeš ji obnovit z Proton Drive.',
  "confirm.thisPhoto": "Tato fotka",
};
