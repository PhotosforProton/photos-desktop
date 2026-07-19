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
  "nav.trash": "Kosz",

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
  "tray.locked": "Zablokowane",
  "tray.lockedHint": "Otwórz, aby odblokować",
  "tray.signedOut": "Nie zalogowano",
  "tray.signedOutHint": "Otwórz, aby się zalogować",

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
  "settings.general": "Ogólne",
  "settings.launchAtLogin": "Uruchamiaj z systemem Windows",
  "settings.launchAtLoginDesc": "Uruchamia się w tle po zalogowaniu do systemu Windows i pokazuje tylko ikonę w zasobniku, dopóki jej nie otworzysz.",
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
    "Gdy nowe zdjęcia trafiają do Twojej biblioteki, są automatycznie pobierane do folderu Proton Photos.",
  "settings.autoDownloadNeedsExplorer":
    "Działa tylko, gdy „Proton Photos” jest widoczne w Eksploratorze plików, a ta opcja jest wyłączona. Pobieranie nadal działa: zapyta, gdzie zapisać zdjęcia.",
  "settings.restartNeeded": "Uruchom ponownie, aby zastosować tę zmianę.",
  "settings.restartNow": "Uruchom ponownie teraz",
  // File types. The "Open with" entries are the app's own to add and take back out;
  // the default handler is not, so that half leads out to Windows rather than
  // pretending to a choice Windows takes from the user alone.
  "settings.fileTypes": "Typy plików",
  "settings.openWith": "Dodaj do listy „Otwórz za pomocą”",
  "settings.openWithDesc":
    "Umieszcza Photos for Proton w menu „Otwórz za pomocą” systemu Windows dla zdjęć JPEG, PNG, GIF, WebP, AVIF, BMP, TIFF i HEIC oraz dla filmów MP4, MOV, M4V i WebM. Po wyłączeniu wpisy zostaną usunięte.",
  "settings.fileTypesFailed": "Nie udało się zmienić typów plików. Spróbuj ponownie.",
  "settings.defaultApp": "Domyślna aplikacja do zdjęć i filmów",
  "settings.defaultAppDesc":
    "W ten sposób nic nie stanie się domyślne: ten wybór Windows przyjmuje tylko od Ciebie, nigdy od programu. Wybierz Photos for Proton w ustawieniach Windows, w sekcji Aplikacje domyślne.",
  "settings.defaultAppOpen": "Otwórz ustawienia Windows",
  "settings.defaultAppFailed": "Nie udało się otworzyć ustawień Windows. Spróbuj ponownie.",
  "settings.lockOnHideDesc":
    "Gdy okno zostaje zamknięte do zasobnika, aplikacja blokuje się i przy następnym otwarciu prosi o hasło.",
  "settings.storage": "Pamięć",
  // Two different places a photo can be kept on this machine: encrypted inside the
  // app, or downloaded into the Proton Photos folder where Windows can read it. The
  // panel names both rather than adding one number to the other.
  "settings.downloadedCount.one": "{count} pobrane zdjęcie",
  "settings.downloadedCount.other": "{count} pobranych zdjęć",
  "settings.downloadedNone": "Brak pobranych zdjęć",
  "settings.downloadedDesc":
    "Pobrane zdjęcia to zwykłe pliki w folderze Proton Photos, więc wyszukiwanie Windows i inne programy mogą je odczytać. Zwalnianie usuwa tylko te kopie lokalne, a Twoje zdjęcia zostają w Protonie.",
  "settings.freeUpAll": "Zwolnij {size}",
  "settings.freeUpNothing": "Nie ma czego zwolnić",
  "settings.freeingUp": "Zwalnianie…",
  "settings.storageOffline": "Zdjęcia offline",
  "settings.storageExplorer": "W Eksploratorze plików",
  "settings.offlineCount.one": "{count} zdjęcie w aplikacji",
  "settings.offlineCount.other": "{count} zdjęć w aplikacji",
  "settings.offlineNone": "Brak zdjęć w aplikacji",
  "settings.offlineDesc":
    "Zdjęcia oznaczone jako dostępne offline pozostają zaszyfrowane w aplikacji. Otwierają się bez połączenia i nigdy nie pojawiają się w folderze Proton Photos, więc nic poza aplikacją nie może ich odczytać.",
  "settings.offlineSaving": "Zapisywanie {done}/{total}…",
  "settings.offlineRemoveAll": "Zwolnij {size}",
  "settings.offlineRemoveNothing": "Nie ma czego zwolnić",
  "settings.offlineRemoving": "Usuwanie…",
  "settings.freeUpFailed": "Nie udało się zwolnić miejsca. Spróbuj ponownie.",

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
  "photos.offline": "Dostępne offline, zaszyfrowane w aplikacji",
  "photos.downloaded": "Pobrane do folderu Proton Photos",
  "photos.renameTitle": "Zmień nazwę zdjęcia",
  "photos.namePlaceholder": "Nazwa pliku",

  // Tile badges
  "badge.motionPhoto": "Zdjęcie ruchome",
  "badge.panorama": "Panorama",
  "badge.raw": "RAW",
  "badge.favorite": "Ulubione",

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
  "albums.noneSub": "Utwórz go tutaj lub upuść folder na okno.",
  "albums.keepDownloaded": "Pobierz ten album do folderu Proton Photos",
  "albums.keptDownloaded": "Pobieranie do folderu Proton Photos (kliknij, aby zatrzymać)",
  "albums.freeUpTitle": "Zwolnić miejsce tego albumu?",
  "albums.freeUpCount.one":
    "Album nie pobiera się już sam. {count} zdjęcie jest już w folderze Proton Photos i może tam zostać, albo możesz zwolnić zajmowane przez nie miejsce. W obu przypadkach zostaje w Protonie.",
  "albums.freeUpCount.other":
    "Album nie pobiera się już sam. W folderze Proton Photos są już zdjęcia w liczbie {count} i mogą tam zostać, albo możesz zwolnić zajmowane przez nie miejsce. W obu przypadkach zostają w Protonie.",
  "albums.freeUpKeep": "Zachowaj pobrane",
  "albums.freeUpConfirm": "Zwolnij",
  "albums.newAlbum": "Nowy album",
  "albums.newTitle": "Nazwij album",
  "albums.namePlaceholder": "Nazwa albumu",
  "albums.create": "Utwórz",
  "albums.createAndAdd": "Utwórz i dodaj",
  "albums.rename": "Zmień nazwę",
  "albums.renameTitle": "Zmień nazwę albumu",
  "albums.share": "Udostępnij album",
  "albums.delete": "Usuń album",
  "albums.deleted": "Album usunięty",
  "albums.addTitle": "Dodaj do albumu",
  "albums.addCount.one": "Wybierz, gdzie umieścić {count} zdjęcie.",
  "albums.addCount.other": "Wybierz, gdzie umieścić zdjęcia w liczbie {count}.",
  "albums.added": "Dodano {count}",
  "albums.addPartial": "Dodano {ok}, nie udało się {failed}",
  "albums.removed": "Usunięto z albumu {count}",
  "albums.removePartial": "Usunięto {ok}, nie udało się {failed}",
  "albums.coverSet": "Okładka zaktualizowana",
  "albums.strandedTitle.one": "{count} zdjęcie jest tylko w tym albumie",
  "albums.strandedTitle.other": "Tylko w tym albumie są zdjęcia w liczbie {count}",
  "albums.strandedMsg.one":
    "Nie ma go na Twojej osi czasu, więc usunięcie albumu usunie też jego. Zapisz je na osi czasu, aby je zachować.",
  "albums.strandedMsg.other":
    "Nie ma ich na Twojej osi czasu, więc usunięcie albumu usunie też je. Zapisz je na osi czasu, aby je zachować.",
  "albums.savePhotos": "Zapisz na osi czasu",
  "albums.deletePhotosToo": "Usuń także zdjęcia",

  // Shared
  "shared.byMe": "Udostępnione przeze mnie",
  "shared.withMe": "Udostępnione mi",
  "shared.flip": "Przełącz między udostępnionymi przeze mnie a udostępnionymi mi",
  "shared.emptyByTitle": "Nie udostępniasz niczego",
  "shared.emptyWithTitle": "Nic nie zostało Ci udostępnione",
  "shared.emptyBySub": "Udostępniane przez Ciebie zdjęcia i albumy pojawią się tutaj.",
  "shared.emptyWithSub": "Zdjęcia i albumy udostępnione Ci przez innych pojawią się tutaj.",
  "shared.publicLink": "Udostępnione przez link publiczny",
  "shared.album": "Album",
  "shared.manage": "Zarządzaj udostępnianiem",
  "shared.back": "Wróć do udostępnionych",

  // Share dialog. A public link's URL carries the secret that decrypts what it
  // points at, so copying it whole is the whole point of the link section. A
  // link's password is never read back, so the dialog reports whether one is set
  // rather than showing it.
  "share.title": "Udostępnianie",
  "share.linkTitle": "Link publiczny",
  "share.linkDesc": "Każdy, kto ma link, może otworzyć to zdjęcie.",
  "share.createLink": "Utwórz link",
  "share.copyLink": "Kopiuj link",
  "share.copied": "Skopiowano",
  "share.removeLink": "Usuń link",
  "share.passwordLabel": "Hasło",
  "share.passwordSet": "Wymagane do otwarcia",
  "share.passwordNone": "Nie ustawiono",
  "share.passwordPlaceholder": "Nowe hasło",
  "share.expiryLabel": "Wygasa",
  "share.expiryNever": "Nigdy",
  "share.expiryPast": "Wybierz datę w przyszłości.",
  "share.add": "Dodaj",
  "share.change": "Zmień",
  "share.set": "Ustaw",
  "share.save": "Zapisz",
  "share.albumInviteOnly": "Albumy udostępnia się przez zaproszenie, a nie linkiem publicznym.",
  "share.peopleTitle": "Osoby",
  "share.emailPlaceholder": "Adres e-mail",
  "share.invite": "Zaproś",
  "share.roleViewer": "Przeglądający",
  "share.roleEditor": "Edytor",
  "share.stateInvited": "Zaproszono",
  "share.stateExternal": "Zaproszono (bez konta Proton)",
  "share.remove": "Usuń",
  "share.noPeople": "Jeszcze nikogo",
  "share.stopSharing": "Zakończ udostępnianie",
  "share.notOwned":
    "To zostało udostępnione Tobie. Tylko właściciel może zmienić, kto ma do tego dostęp.",
  "share.badEmail": "To nie wygląda na adres e-mail.",
  "share.copyFailed": "Nie udało się skopiować linku",
  "share.failed": "Nie udało się zmienić udostępniania",
  "share.working": "Trwa…",

  // Trash
  "trash.emptyTitle": "Kosz jest pusty",
  "trash.emptySub": "Zdjęcia przeniesione do kosza pojawiają się tutaj i możesz je przywrócić.",
  "trash.emptyAction": "Opróżnij kosz",
  "trash.moved": "Przeniesiono do kosza {count}",
  "trash.movedPartial": "Przeniesiono do kosza {ok}, nie udało się {failed}",
  "trash.restored": "Przywrócono {count}",
  "trash.deleted": "Trwale usunięto {count}",
  "trash.emptied": "Kosz opróżniony",
  "trash.partial": "Wykonano {ok}, nie udało się {failed}",

  // Photo viewer / lightbox
  "viewer.details": "Szczegóły",
  "viewer.offlineAdd": "Zachowaj kopię offline, zaszyfrowaną w aplikacji",
  "viewer.offlineRemove": "Usuń kopię offline",
  "viewer.download": "Pobierz do folderu Proton Photos",
  "viewer.saveToFolder": "Zapisz kopię w wybranym miejscu",
  "viewer.freeUp": "Usuń kopię lokalną, aby zwolnić miejsce",
  "viewer.detailsShortcut": "Szczegóły (I)",
  "viewer.contents": "Zawartość",
  "viewer.contentsShortcut": "Zawartość (L)",
  "viewer.filmstrip": "Sąsiednie elementy",
  "viewer.position": "{n} z {total}",
  "viewer.favoriteShortcut": "Dodaj do ulubionych (F)",
  "viewer.unfavoriteShortcut": "Usuń z ulubionych (F)",
  "viewer.trashShortcut": "Przenieś do kosza (Del)",
  "viewer.shareShortcut": "Udostępnij (S)",
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
  "viewer.onServer": "Zajęte miejsce",
  "viewer.albums": "Albumy",
  "viewer.shared": "Udostępnianie",
  "viewer.sharedPublic": "Link publiczny",
  "viewer.sharedPeople": "Z osobami",
  "viewer.sharedNo": "Nie",
  "viewer.unverified": " (niezweryfikowane)",
  "viewer.trashFailed": "Nie udało się przenieść tego zdjęcia do kosza.",
  "viewer.favoriteFailed": "Nie udało się zaktualizować ulubionych.",
  "viewer.downloadFailed": "Nie udało się pobrać tego zdjęcia.",
  "viewer.zoomOut": "Pomniejsz",
  "viewer.zoomIn": "Powiększ",
  "viewer.resetFit": "Dopasuj do ekranu",
  "viewer.videoLoading": "Ładowanie wideo…",
  "viewer.videoError":
    "Tego formatu wideo nie można tu odtworzyć. Pobierz plik i obejrzyj go w innym odtwarzaczu.",
  "viewer.videoTooLarge":
    "To wideo jest za duże, aby odtworzyć je tutaj. Pobierz plik i obejrzyj go w innym odtwarzaczu.",

  // The viewer's own video controls, which stand in for the browser's.
  "viewer.videoPlay": "Odtwórz (Spacja)",
  "viewer.videoPause": "Wstrzymaj (Spacja)",
  "viewer.videoStepBack": "Poprzednia klatka",
  "viewer.videoStepForward": "Następna klatka",
  "viewer.videoSeek": "Pozycja odtwarzania",
  "viewer.videoMute": "Wycisz",
  "viewer.videoUnmute": "Wyłącz wyciszenie",

  // Local file viewer: a file opened from File Explorer, which the app can show
  // with nobody signed in. Everything both viewers say alike comes from above.
  "local.camera": "Aparat",
  "local.created": "Utworzono",
  "local.path": "Lokalizacja",
  "local.upload": "Prześlij do Protona",
  "local.uploadUnsupported": "Proton nie przyjmuje tego typu pliku",
  "local.uploading": "Wysyłanie…",
  "local.uploaded": "Zapisano w Protonie",
  "local.uploadSkipped": "Już zapisane",
  "local.uploadFailed": "Wysyłanie nie powiodło się. Spróbuj ponownie.",
  "local.delete": "Usuń",
  "local.deleteTitle": "Usunąć ten plik?",
  "local.deleteMessage": "Plik „{name}” zostanie przeniesiony do kosza.",
  "local.notFound": "Ten plik został przeniesiony lub usunięty.",
  "local.unreadable":
    "Nie udało się odczytać tego pliku. Może być otwarty w innym programie albo poza zasięgiem tego konta.",
  "local.openFailed": "Nie udało się otworzyć tego pliku.",
  "local.decodeFailed":
    "Nie udało się odczytać tego zdjęcia. Plik może być uszkodzony lub niekompletny.",
  "local.videoUnsupported":
    "Tego formatu wideo nie można tu odtworzyć. Otwórz plik w innym odtwarzaczu.",
  "local.noCodec":
    "Windows nie ma dekodera dla tego formatu, więc nie da się go tutaj pokazać. W Microsoft Store jest to, czego brakuje dla części z nich: rozszerzenia HEIF i HEVC dla zdjęć HEIC oraz Raw Image Extension dla plików raw z aparatów.",
  "local.signInTitle": "Zaloguj się, aby przesłać",
  "local.signInBody":
    "Otworzy się okno aplikacji, w którym możesz się zalogować. Ten plik pozostanie tu otwarty.",
  "local.signInAction": "Zaloguj się",

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
  "selection.restore": "Przywróć",
  "selection.deleteForever": "Usuń trwale",
  "selection.more": "Więcej",
  "selection.download": "Pobierz",
  "selection.freeUp": "Zwolnij",
  "selection.addToAlbum": "Dodaj do albumu",
  "selection.removeFromAlbum": "Usuń z albumu",
  "selection.setCover": "Ustaw jako okładkę",
  "selection.rename": "Zmień nazwę",
  "selection.share": "Udostępnij",
  "selection.favorite": "Dodaj do ulubionych",
  "selection.unfavorite": "Usuń z ulubionych",
  "selection.offlineAdd": "Dostępne offline",
  "selection.offlineRemove": "Usuń kopię offline",
  // Download: the copy that lands in the Proton Photos folder, where Windows and any
  // other program can read it. Never called offline, which is the app's own copy.
  "download.freedUp": "Zwolniono {count}",
  "download.freedUpNone": "Nic nie zostało zwolnione",
  "download.notDownloaded": "Brak pobranych plików do zwolnienia",
  "download.running": "Pobieranie…",
  "download.progress": "Pobieranie {done}/{total}…",
  "download.done": "Pobrano {count} do folderu Proton Photos",
  "download.donePartial": "Pobrano {ok} z {total}",
  "download.doneNone":
    "Nic nie zostało pobrane. Folder Proton Photos może nie być jeszcze gotowy.",
  "download.alreadyDownloaded": "Już pobrane",
  "download.saved": "Zapisano {count} w folderze",
  "download.partial": "Zapisano {ok}, nie udało się {failed}",

  // Available offline: the app's own encrypted copy, which is not the Proton Photos
  // folder. These say where the copy went, so the two are never mistaken for one another.
  "offline.added.one": "{count} zdjęcie jest zapisywane do użytku offline",
  "offline.added.other": "{count} zdjęć jest zapisywanych do użytku offline",
  "offline.removed.one": "Usunięto {count} kopię offline",
  "offline.removed.other": "Usunięto {count} kopii offline",
  "offline.alreadyOffline": "Już dostępne offline",
  "offline.noneOffline": "Brak kopii offline do usunięcia",
  "offline.failed": "nie udało się zapisać do użytku offline",

  // Trash confirmation
  "confirm.trashTitle": "Przenieść do kosza?",
  "confirm.trashConfirm": "Przenieś do kosza",
  "confirm.trashCount.one":
    "{count} zdjęcie zostanie przeniesione do kosza. Możesz je przywrócić w zakładce Kosz.",
  "confirm.trashCount.other":
    "{count} zdjęć zostanie przeniesionych do kosza. Możesz je przywrócić w zakładce Kosz.",
  "confirm.trashName":
    "„{name}” zostanie przeniesione do kosza. Możesz je przywrócić w zakładce Kosz.",
  "confirm.thisPhoto": "To zdjęcie",

  // Remove from album. The photos stay in Photos; only the album loses them.
  "confirm.removeTitle": "Usunąć z albumu?",
  "confirm.removeConfirm": "Usuń",
  "confirm.removeCount.one":
    "{count} zdjęcie zniknie z tego albumu, ale zostanie na Twojej osi czasu.",
  "confirm.removeCount.other":
    "Zdjęcia w liczbie {count} znikną z tego albumu, ale zostaną na Twojej osi czasu.",

  // Delete-forever confirmation. Nothing in the app or at Proton undoes these.
  "confirm.deleteTitle": "Usunąć trwale?",
  "confirm.deleteConfirm": "Usuń trwale",
  "confirm.deleteCount.one":
    "{count} zdjęcie zostanie trwale usunięte z Proton. Tej operacji nie można cofnąć.",
  "confirm.deleteCount.other":
    "{count} zdjęć zostanie trwale usuniętych z Proton. Tej operacji nie można cofnąć.",
  "confirm.emptyTitle": "Opróżnić kosz?",
  "confirm.emptyConfirm": "Usuń wszystko",
  "confirm.emptyMessage":
    "Cała zawartość kosza zostanie trwale usunięta z Proton. Tej operacji nie można cofnąć.",

  // Deleting an album skips the trash, so the album is gone for good even though
  // the photos in your timeline are not.
  "confirm.deleteAlbumTitle": "Usunąć ten album?",
  "confirm.deleteAlbumMessage":
    "Album zostanie usunięty i nie da się go przywrócić. Zdjęcia na Twojej osi czasu zostają.",

  // Revoking sharing takes access away from people who may already hold the link,
  // and nothing is deleted by it, so both of these say exactly what is lost.
  "confirm.removeLinkTitle": "Usunąć link?",
  "confirm.removeLinkMessage":
    "Link przestanie działać dla wszystkich, którzy go mają. Osoby zaproszone e-mailem zachowają dostęp.",
  "confirm.removeLinkConfirm": "Usuń link",
  "confirm.replaceLinkTitle": "Zastąpić link?",
  "confirm.replaceLinkMessage":
    "Ten link jest zbyt stary, aby go zmienić, więc zapisanie zastąpi go nowym pod innym adresem. Stary link przestanie działać dla wszystkich, którzy go mają, a jego hasło zostanie usunięte. Nowy link trafi do schowka.",
  "confirm.replaceLinkConfirm": "Zastąp link",
  "confirm.stopSharingTitle": "Zakończyć udostępnianie?",
  "confirm.stopSharingMessage":
    "Link przestanie działać, a wszystkie zaproszone osoby stracą dostęp. Nic nie zostanie usunięte.",
  "confirm.stopSharingConfirm": "Zakończ udostępnianie",

  // Freeing up drops the downloaded copies only. Nothing leaves Proton, so this asks
  // before a big change without treating it as one there is no way back from.
  "confirm.freeUpAllTitle": "Zwolnić wszystkie pobrane zdjęcia?",
  "confirm.freeUpAllMessage":
    "{size} w folderze Proton Photos zostanie usunięte. Twoje zdjęcia zostają w Protonie i pobierają się ponownie, gdy je otworzysz.",
  "confirm.freeUpAllConfirm": "Zwolnij",

  // Removing every offline copy. The photos themselves are untouched, so this warns
  // about the download they will need next time and nothing more.
  "confirm.removeOfflineAllTitle": "Usunąć wszystkie kopie offline?",
  "confirm.removeOfflineAllMessage":
    "{size} przechowywane w aplikacji w postaci zaszyfrowanej zostanie usunięte. Twoje zdjęcia zostają w Protonie, a do ich ponownego otwarcia potrzebne będzie połączenie.",
  "confirm.removeOfflineAllConfirm": "Usuń",
};
