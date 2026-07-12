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

// Polish (pl) strings. Keys mirror en.ts exactly.
export const pl: Record<string, string> = {
  // Common
  "common.cancel": "Anuluj",
  "common.close": "Zamknij",
  "common.back": "Wstecz",
  "common.loading": "Ładowanie…",
  "common.photoCount.one": "{count} zdjęcie",
  "common.photoCount.other": "{count} zdjęć",

  // Navigation
  "nav.photos": "Zdjęcia",
  "nav.albums": "Albumy",
  "nav.shared": "Udostępnione",

  // App shell
  "app.restoring": "Przywracanie sesji…",
  "update.available": "Dostępna jest aktualizacja {version}",
  "update.now": "Aktualizuj",
  "update.updating": "Aktualizowanie…",
  "update.failed": "Aktualizacja nie powiodła się",
  "update.hashError": "Weryfikacja pobranego pliku nie powiodła się",
  "menu.reload": "Załaduj ponownie",
  "menu.moreSoon": "Więcej wkrótce…",
  "menu.quit": "Zakończ",

  // Tray popup
  "tray.open": "Otwórz Photos for Proton",
  "tray.syncNow": "Synchronizuj teraz",
  "tray.syncing": "Synchronizowanie…",
  "tray.synced": "Aktualne",

  // Login
  "login.subtitle": "Zaloguj się do swojego konta Proton",
  "login.emailLabel": "E-mail lub nazwa użytkownika",
  "login.passwordLabel": "Hasło",
  "login.passwordPlaceholder": "Hasło",
  "login.signIn": "Zaloguj się",
  "login.signingIn": "Logowanie…",
  "login.twofaLabel": "Kod dwuskładnikowy",
  "login.verify": "Zweryfikuj",
  "login.verifying": "Weryfikacja…",
  "login.captchaHint": "Proton prosi o potwierdzenie, że jesteś człowiekiem.",
  "login.captchaExpired": "Captcha wygasła. Rozwiąż ją ponownie.",

  // Lock screen (returning cold start)
  "lock.subtitle": "Wpisz hasło, aby odblokować",
  "lock.unlock": "Odblokuj",
  "lock.unlocking": "Odblokowywanie…",
  "lock.wrongPassword": "Nieprawidłowe hasło",
  "lock.failed": "Nie udało się odblokować. Spróbuj ponownie.",
  "lock.differentAccount": "Użyj innego konta",

  // Titlebar
  "titlebar.minimize": "Minimalizuj",
  "titlebar.maximize": "Maksymalizuj",

  // Settings
  "settings.title": "Ustawienia",
  "settings.appearance": "Wygląd",
  "settings.theme": "Motyw",
  "settings.themeDesc": "System podąża za Windows i zmienia się razem z nim.",
  "settings.theme.dark": "Ciemny",
  "settings.theme.light": "Jasny",
  "settings.theme.system": "Systemowy",
  "settings.palette": "Paleta",
  "settings.paletteDesc": "Kolor akcentu używany w całej aplikacji.",
  "settings.palette.default": "Domyślna",
  "settings.palette.forest": "Las",
  "settings.palette.sunset": "Zachód słońca",
  "settings.palette.sea": "Morze",
  "settings.palette.sepia": "Sepia",
  "settings.palette.mono": "Mono",
  "settings.palette.amoled": "Czysta czerń (AMOLED)",
  "settings.language": "Język",
  "settings.languageDesc": "Wybierz język wyświetlania.",
  "settings.timeline": "Oś czasu",
  "settings.hideAlbum": "Ukrywaj zdjęcia w albumach Drive",
  "settings.hideAlbumDesc":
    "Zdjęcia dodane do albumu Drive nie pojawią się na Twojej głównej osi czasu. Nadal widać je w kartach Albumy i Udostępnione oraz w filtrach kategorii.",
  "settings.security": "Bezpieczeństwo",
  "settings.lockOnHide": "Wymagaj hasła przy ponownym otwieraniu z zasobnika",
  "settings.debug": "Nakładka debugowania",
  "settings.debugDesc": "Pokazuj na żywo zużycie pamięci (sterta i pamięć podręczna).",
  "settings.explorer": "Eksplorator plików",
  "settings.showInExplorer": "Pokaż „Proton Photos” w Eksploratorze plików",
  "settings.showInExplorerDesc":
    "Dodaje wpis Proton Photos do paska bocznego Eksploratora z Twoimi zdjęciami z chmury. Zmiana zadziała po ponownym uruchomieniu.",
  "settings.autoDownload": "Automatycznie pobieraj nowe zdjęcia",
  "settings.autoDownloadDesc":
    "Gdy nowe zdjęcia trafiają do Twojej biblioteki, automatycznie zachowuj ich kopię na tym urządzeniu.",
  "settings.restartNeeded": "Uruchom ponownie, aby zastosować tę zmianę.",
  "settings.restartNow": "Uruchom ponownie teraz",
  "settings.lockOnHideDesc":
    "Gdy okno zostaje zamknięte do zasobnika, aplikacja blokuje się i przy następnym otwarciu prosi o hasło.",

  // Profile menu
  "profile.storage": "Pamięć",
  "profile.used": "Użyto {size}",
  "profile.total": "Łącznie {size}",
  "profile.signOut": "Wyloguj się",

  // Avatar
  "avatar.uploading": "Przesyłanie",
  "avatar.syncing": "Synchronizowanie",
  "avatar.account": "Konto i ustawienia",
  "avatar.showUploads": "Pokaż przesyłane pliki",

  // Photos view
  "photos.all": "Wszystkie",
  "photos.search": "Szukaj",
  "photos.searchPlaceholder": "Szukaj według nazwy pliku lub typu…",
  "photos.closeSearch": "Zamknij wyszukiwanie",
  "photos.smaller": "Mniejsze",
  "photos.bigger": "Większe",
  "photos.indexing": "Indeksowanie {done}/{total}",
  "photos.uploadTitle": "Prześlij zdjęcia lub folder jako album",
  "photos.uploadingProgress": "Przesyłanie {progress}",
  "photos.noMatches": "Brak dopasowań",
  "photos.noPhotos": "Brak zdjęć",
  "photos.noPhotosSub": "Twoje zdjęcia pojawią się tutaj po synchronizacji.",
  "photos.stillIndexing": "Indeksowanie trwa, pojawi się więcej wyników.",
  "photos.loadingThumbnails": "Ładowanie miniatur…",
  "photos.dropTitle": "Upuść, aby przesłać",
  "photos.dropSub": "Folder stanie się albumem o tej samej nazwie",
  "photos.offline": "Dostępne offline",

  // Search type filters
  "filter.images": "Obrazy",
  "filter.videos": "Filmy",

  // Filter panel
  "filter.title": "Filtr",
  "filter.categories": "Kategorie",
  "filter.type": "Typ",
  "filter.mediaAll": "Wszystkie",
  "filter.mediaPhotos": "Zdjęcia",
  "filter.reset": "Resetuj",

  // Categories
  "category.fav": "Ulubione",
  "category.screen": "Zrzuty ekranu",
  "category.video": "Filmy",
  "category.live": "Zdjęcia na żywo",
  "category.selfie": "Selfie",
  "category.portrait": "Portrety",
  "category.burst": "Serie zdjęć",
  "category.pano": "Panoramy",
  "category.raw": "RAW",

  // Albums
  "albums.backToAlbums": "Wróć do albumów",
  "albums.untitled": "Album bez tytułu",
  "albums.empty": "Ten album jest pusty",
  "albums.none": "Brak albumów",
  "albums.noneSub": "Upuść folder na okno, aby go utworzyć.",
  "albums.keepOffline": "Zachowaj ten album na tym urządzeniu",
  "albums.keptOffline": "Zachowano na tym urządzeniu (kliknij, aby zatrzymać)",

  // Shared
  "shared.byMe": "Udostępnione przeze mnie",
  "shared.withMe": "Udostępnione mi",
  "shared.emptyByTitle": "Nie udostępniasz niczego",
  "shared.emptyWithTitle": "Nic nie zostało Ci udostępnione",
  "shared.emptyBySub": "Udostępniane przez Ciebie zdjęcia i albumy pojawią się tutaj.",
  "shared.emptyWithSub": "Zdjęcia i albumy udostępnione Ci przez innych pojawią się tutaj.",
  "shared.publicLink": "Udostępnione przez link publiczny",
  "shared.album": "Album",

  // Photo viewer / lightbox
  "viewer.details": "Szczegóły",
  "viewer.download": "Zachowaj offline",
  "viewer.freeUp": "Zwolnij miejsce",
  "viewer.detailsShortcut": "Szczegóły (I)",
  "viewer.trashShortcut": "Przenieś do kosza (Del)",
  "viewer.rename": "Kliknij, aby zmienić nazwę",
  "viewer.closeShortcut": "Zamknij (Esc)",
  "viewer.prev": "Poprzednie (←)",
  "viewer.next": "Następne (→)",
  "viewer.name": "Nazwa",
  "viewer.type": "Typ",
  "viewer.dimensions": "Wymiary",
  "viewer.taken": "Wykonano",
  "viewer.added": "Dodano",
  "viewer.modified": "Zmodyfikowano",
  "viewer.size": "Rozmiar",
  "viewer.onServer": "Na serwerze",
  "viewer.albums": "Albumy",
  "viewer.shared": "Udostępnianie",
  "viewer.sharedPublic": "Link publiczny",
  "viewer.sharedPeople": "Z osobami",
  "viewer.sharedNo": "Nie",
  "viewer.unverified": " (niezweryfikowane)",
  "viewer.trashFailed": "nie udało się przenieść do kosza",
  "viewer.zoomOut": "Pomniejsz",
  "viewer.zoomIn": "Powiększ",
  "viewer.resetFit": "Dopasuj do ekranu",
  "viewer.videoLoading": "Ładowanie wideo…",
  "viewer.videoError": "Tego formatu wideo nie można tu odtworzyć. Pobierz plik, aby go obejrzeć.",
  "viewer.videoTooLarge": "Ten film jest za duży, aby odtworzyć go tutaj. Pobierz go, aby obejrzeć.",

  // Upload panel
  "upload.title": "Prześlij",
  "upload.filterName": "Zdjęcia i filmy",
  "upload.dropHint": "Upuść zdjęcia lub folder w dowolnym miejscu okna",
  "upload.dropSub":
    "Zdjęcia trafiają prosto na Twoją oś czasu. Folder staje się albumem o tej samej nazwie.",
  "upload.chooseFiles": "Wybierz pliki",
  "upload.chooseFolder": "Wybierz folder",
  "upload.alreadyThere": "{count} już przesłano",
  "upload.failedCount": "{count} nieudanych",
  "upload.clear": "Wyczyść",
  "upload.statusUploading": "przesyłanie…",
  "upload.statusSkipped": "pominięto",
  "upload.statusQueued": "w kolejce",
  "upload.statusFailed": "nieudane",

  // Grid tile
  "grid.select": "Zaznacz",
  "grid.deselect": "Odznacz",

  // Selection bar
  "selection.cancel": "Anuluj zaznaczenie (Esc)",
  "selection.count.one": "Zaznaczono {count} zdjęcie",
  "selection.count.other": "Zaznaczono {count} zdjęć",
  "selection.trash": "Do kosza",
  "selection.download": "Pobierz",
  "selection.freeUp": "Zwolnij",
  "download.freedUp": "Zwolniono {count}",
  "download.notDownloaded": "Brak pobranych plików do zwolnienia",
  "download.running": "Pobieranie…",
  "download.done": "Zachowano offline {count}",
  "download.alreadyOffline": "Już dostępne offline",
  "download.partial": "Zapisano {ok}, nie udało się {failed}",

  // Trash confirmation
  "confirm.trashTitle": "Przenieść do kosza?",
  "confirm.trashConfirm": "Przenieś do kosza",
  "confirm.trashCount.one":
    "{count} zdjęcie zostanie przeniesione do kosza. Możesz je przywrócić z Proton Drive.",
  "confirm.trashCount.other":
    "{count} zdjęć zostanie przeniesionych do kosza. Możesz je przywrócić z Proton Drive.",
  "confirm.trashName":
    '„{name}” zostanie przeniesione do kosza. Możesz je przywrócić z Proton Drive.',
  "confirm.thisPhoto": "To zdjęcie",
};
