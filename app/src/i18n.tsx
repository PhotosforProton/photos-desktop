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

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { invoke } from "@tauri-apps/api/core";

/**
 * Runtime internationalization. Strings are keyed by short stable ids and looked
 * up in the active dictionary, falling back to English, then to the key itself.
 * The chosen language rides inside the same persisted `settings` object as the
 * theme, so it restores with everything else.
 */
export type Lang = "en" | "hu";

/** The default before any choice is saved: the OS language if we speak it. */
export const BROWSER_LANG: Lang = navigator.language.startsWith("hu") ? "hu" : "en";

const en: Record<string, string> = {
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
  "menu.reload": "Reload",
  "menu.moreSoon": "More soon…",
  "menu.quit": "Quit",

  // Tray popup
  "tray.open": "Open Photos for Proton",

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
  "download.running": "Downloading…",
  "download.done": "Saved {count} to the folder",
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

const hu: Record<string, string> = {
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
  "menu.reload": "Újratöltés",
  "menu.moreSoon": "Hamarosan több…",
  "menu.quit": "Kilépés",

  // Tray popup
  "tray.open": "Photos for Proton megnyitása",

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
  "download.running": "Letöltés…",
  "download.done": "{count} fájl elmentve a mappába",
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

const DICTS: Record<Lang, Record<string, string>> = { en, hu };

export type TFunc = (key: string, vars?: Record<string, string | number>) => string;

type LangCtx = { lang: Lang; setLang: (l: Lang) => void };

const LangContext = createContext<LangCtx>({ lang: "en", setLang: () => {} });

/** Merge a single field into the persisted `settings` object without dropping the rest. */
async function persistLang(l: Lang): Promise<void> {
  try {
    const raw = await invoke<string | null>("store_get", { name: "settings" });
    const obj = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    obj.lang = l;
    await invoke("store_set", { name: "settings", value: JSON.stringify(obj) });
  } catch {
    /* persistence is best-effort */
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(BROWSER_LANG);

  // Restore the saved choice, if any. Until it lands, the browser default shows.
  useEffect(() => {
    (async () => {
      try {
        const raw = await invoke<string | null>("store_get", { name: "settings" });
        if (!raw) return;
        const stored = JSON.parse(raw).lang;
        if (stored === "en" || stored === "hu") setLangState(stored);
      } catch {
        /* keep the browser default */
      }
    })();
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    void persistLang(l);
  }, []);

  const value = useMemo<LangCtx>(() => ({ lang, setLang }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangCtx {
  return useContext(LangContext);
}

/** Returns `t(key, vars?)`: active dictionary, then English, then the key itself. */
export function useT(): TFunc {
  const { lang } = useContext(LangContext);
  return useCallback<TFunc>(
    (key, vars) => {
      let s = DICTS[lang][key] ?? en[key] ?? key;
      if (vars) {
        for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]));
      }
      return s;
    },
    [lang],
  );
}
