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

// German (de) strings. Keys mirror en.ts exactly.
export const de: Record<string, string> = {
  // Common
  "common.cancel": "Abbrechen",
  "common.close": "Schließen",
  "common.back": "Zurück",
  "common.loading": "Wird geladen…",
  "common.photoCount.one": "{count} Foto",
  "common.photoCount.other": "{count} Fotos",

  // Navigation
  "nav.photos": "Fotos",
  "nav.albums": "Alben",
  "nav.shared": "Geteilt",

  // App shell
  "app.restoring": "Sitzung wird wiederhergestellt…",
  "update.available": "Update {version} ist verfügbar",
  "update.now": "Aktualisieren",
  "update.updating": "Wird aktualisiert…",
  "update.failed": "Update fehlgeschlagen",
  "update.hashError": "Überprüfung des Downloads fehlgeschlagen",
  "menu.reload": "Neu laden",
  "menu.moreSoon": "Bald mehr…",
  "menu.quit": "Beenden",

  // Tray popup
  "tray.open": "Photos for Proton öffnen",
  "tray.syncNow": "Jetzt synchronisieren",
  "tray.syncing": "Wird synchronisiert…",
  "tray.synced": "Auf dem neuesten Stand",

  // Login
  "login.subtitle": "Melde dich bei deinem Proton-Konto an",
  "login.emailLabel": "E-Mail oder Benutzername",
  "login.passwordLabel": "Passwort",
  "login.passwordPlaceholder": "Passwort",
  "login.signIn": "Anmelden",
  "login.signingIn": "Anmeldung läuft…",
  "login.twofaLabel": "Zwei-Faktor-Code",
  "login.verify": "Bestätigen",
  "login.verifying": "Wird bestätigt…",
  "login.captchaHint": "Proton bittet dich zu bestätigen, dass du ein Mensch bist.",
  "login.captchaExpired": "Das Captcha ist abgelaufen. Bitte löse es erneut.",

  // Lock screen (returning cold start)
  "lock.subtitle": "Gib dein Passwort ein, um zu entsperren",
  "lock.unlock": "Entsperren",
  "lock.unlocking": "Wird entsperrt…",
  "lock.wrongPassword": "Falsches Passwort",
  "lock.failed": "Entsperren fehlgeschlagen. Bitte versuche es erneut.",
  "lock.differentAccount": "Anderes Konto verwenden",

  // Titlebar
  "titlebar.minimize": "Minimieren",
  "titlebar.maximize": "Maximieren",

  // Settings
  "settings.title": "Einstellungen",
  "settings.appearance": "Darstellung",
  "settings.theme": "Design",
  "settings.themeDesc": "System folgt Windows und passt sich weiter an, wenn sich das Design ändert.",
  "settings.theme.dark": "Dunkel",
  "settings.theme.light": "Hell",
  "settings.theme.system": "System",
  "settings.palette": "Palette",
  "settings.paletteDesc": "Akzentfarbe für die gesamte App.",
  "settings.palette.default": "Standard",
  "settings.palette.forest": "Wald",
  "settings.palette.sunset": "Sonnenuntergang",
  "settings.palette.sea": "Meer",
  "settings.palette.sepia": "Sepia",
  "settings.palette.mono": "Mono",
  "settings.palette.amoled": "Reines Schwarz (AMOLED)",
  "settings.language": "Sprache",
  "settings.languageDesc": "Wähle die Anzeigesprache.",
  "settings.timeline": "Zeitleiste",
  "settings.hideAlbum": "Fotos in Drive-Alben ausblenden",
  "settings.hideAlbumDesc":
    "Fotos, die einem Drive-Album hinzugefügt wurden, erscheinen nicht in deiner Haupt-Zeitleiste. In den Tabs Alben und Geteilt sowie in den Kategoriefiltern bleiben sie sichtbar.",
  "settings.security": "Sicherheit",
  "settings.lockOnHide": "Passwort beim erneuten Öffnen aus der Taskleiste verlangen",
  "settings.debug": "Debug-Overlay",
  "settings.debugDesc": "Live-Speicheranzeige einblenden (Heap- und Cache-Größen).",
  "settings.explorer": "Datei-Explorer",
  "settings.showInExplorer": '"Proton Photos" im Datei-Explorer anzeigen',
  "settings.showInExplorerDesc":
    "Fügt der Explorer-Seitenleiste einen Eintrag für Proton Photos mit deinen Cloud-Fotos hinzu. Wird nach einem Neustart wirksam.",
  "settings.autoDownload": "Neue Fotos automatisch herunterladen",
  "settings.autoDownloadDesc":
    "Sobald neue Fotos zu deiner Bibliothek hinzukommen, wird automatisch eine Kopie auf diesem Gerät behalten.",
  "settings.restartNeeded": "Starte neu, um diese Änderung anzuwenden.",
  "settings.restartNow": "Jetzt neu starten",
  "settings.lockOnHideDesc":
    "Wird das Fenster in die Taskleiste geschlossen, sperrt sich die App und fragt beim nächsten Öffnen nach deinem Passwort.",

  // Profile menu
  "profile.storage": "Speicher",
  "profile.used": "{size} belegt",
  "profile.total": "{size} gesamt",
  "profile.signOut": "Abmelden",

  // Avatar
  "avatar.uploading": "Wird hochgeladen",
  "avatar.syncing": "Wird synchronisiert",
  "avatar.account": "Konto und Einstellungen",
  "avatar.showUploads": "Uploads anzeigen",

  // Photos view
  "photos.all": "Alle",
  "photos.search": "Suchen",
  "photos.searchPlaceholder": "Nach Dateiname oder Typ suchen…",
  "photos.closeSearch": "Suche schließen",
  "photos.smaller": "Kleiner",
  "photos.bigger": "Größer",
  "photos.indexing": "Indexierung {done}/{total}",
  "photos.uploadTitle": "Fotos hochladen oder einen Ordner als Album",
  "photos.uploadingProgress": "Wird hochgeladen {progress}",
  "photos.noMatches": "Keine Treffer",
  "photos.noPhotos": "Noch keine Fotos",
  "photos.noPhotosSub": "Deine Fotos erscheinen hier nach der Synchronisierung.",
  "photos.stillIndexing": "Indexierung läuft noch, weitere Ergebnisse folgen.",
  "photos.loadingThumbnails": "Vorschaubilder werden geladen…",
  "photos.dropTitle": "Zum Hochladen ablegen",
  "photos.dropSub": "Ein Ordner wird zu einem Album mit demselben Namen",
  "photos.offline": "Offline verfügbar",

  // Search type filters
  "filter.images": "Bilder",
  "filter.videos": "Videos",

  // Filter panel
  "filter.title": "Filter",
  "filter.categories": "Kategorien",
  "filter.type": "Typ",
  "filter.mediaAll": "Alle",
  "filter.mediaPhotos": "Fotos",
  "filter.reset": "Zurücksetzen",

  // Categories
  "category.fav": "Favoriten",
  "category.screen": "Screenshots",
  "category.video": "Videos",
  "category.live": "Live-Fotos",
  "category.selfie": "Selfies",
  "category.portrait": "Porträts",
  "category.burst": "Serienaufnahmen",
  "category.pano": "Panoramen",
  "category.raw": "RAW",

  // Albums
  "albums.backToAlbums": "Zurück zu den Alben",
  "albums.untitled": "Unbenanntes Album",
  "albums.empty": "Dieses Album ist leer",
  "albums.none": "Noch keine Alben",
  "albums.noneSub": "Ziehe einen Ordner auf das Fenster, um eines zu erstellen.",
  "albums.keepOffline": "Dieses Album auf diesem Gerät behalten",
  "albums.keptOffline": "Auf diesem Gerät behalten (zum Beenden klicken)",

  // Shared
  "shared.byMe": "Von mir geteilt",
  "shared.withMe": "Mit mir geteilt",
  "shared.emptyByTitle": "Du teilst nichts",
  "shared.emptyWithTitle": "Nichts mit dir geteilt",
  "shared.emptyBySub": "Fotos und Alben, die du teilst, erscheinen hier.",
  "shared.emptyWithSub": "Fotos und Alben, die andere mit dir teilen, erscheinen hier.",
  "shared.publicLink": "Über öffentlichen Link geteilt",
  "shared.album": "Album",

  // Photo viewer / lightbox
  "viewer.details": "Details",
  "viewer.download": "Offline behalten",
  "viewer.freeUp": "Speicher freigeben",
  "viewer.detailsShortcut": "Details (I)",
  "viewer.trashShortcut": "In den Papierkorb (Del)",
  "viewer.rename": "Zum Umbenennen klicken",
  "viewer.closeShortcut": "Schließen (Esc)",
  "viewer.prev": "Vorheriges (←)",
  "viewer.next": "Nächstes (→)",
  "viewer.name": "Name",
  "viewer.type": "Typ",
  "viewer.dimensions": "Abmessungen",
  "viewer.taken": "Aufgenommen",
  "viewer.added": "Hinzugefügt",
  "viewer.modified": "Geändert",
  "viewer.size": "Größe",
  "viewer.onServer": "Auf dem Server",
  "viewer.albums": "Alben",
  "viewer.shared": "Geteilt",
  "viewer.sharedPublic": "Öffentlicher Link",
  "viewer.sharedPeople": "Mit Personen",
  "viewer.sharedNo": "Nein",
  "viewer.unverified": " (nicht verifiziert)",
  "viewer.trashFailed": "konnte nicht in den Papierkorb verschoben werden",
  "viewer.zoomOut": "Verkleinern",
  "viewer.zoomIn": "Vergrößern",
  "viewer.resetFit": "An Fenster anpassen",
  "viewer.videoLoading": "Video wird geladen…",
  "viewer.videoError": "Dieses Videoformat kann hier nicht abgespielt werden. Lade es zum Ansehen herunter.",
  "viewer.videoTooLarge": "Dieses Video ist zu groß, um hier abgespielt zu werden. Lade es zum Ansehen herunter.",

  // Upload panel
  "upload.title": "Upload",
  "upload.filterName": "Fotos und Videos",
  "upload.dropHint": "Lege Fotos oder einen Ordner irgendwo auf dem Fenster ab",
  "upload.dropSub":
    "Fotos gehen direkt in deine Zeitleiste. Ein Ordner wird zu einem Album mit demselben Namen.",
  "upload.chooseFiles": "Dateien auswählen",
  "upload.chooseFolder": "Ordner auswählen",
  "upload.alreadyThere": "{count} bereits vorhanden",
  "upload.failedCount": "{count} fehlgeschlagen",
  "upload.clear": "Leeren",
  "upload.statusUploading": "wird hochgeladen…",
  "upload.statusSkipped": "übersprungen",
  "upload.statusQueued": "in Warteschlange",
  "upload.statusFailed": "fehlgeschlagen",

  // Grid tile
  "grid.select": "Auswählen",
  "grid.deselect": "Abwählen",

  // Selection bar
  "selection.cancel": "Auswahl abbrechen (Esc)",
  "selection.count.one": "{count} Foto ausgewählt",
  "selection.count.other": "{count} Fotos ausgewählt",
  "selection.trash": "Papierkorb",
  "selection.download": "Herunterladen",
  "selection.freeUp": "Freigeben",
  "download.freedUp": "{count} freigegeben",
  "download.notDownloaded": "Keine heruntergeladenen Dateien zum Freigeben",
  "download.running": "Wird heruntergeladen…",
  "download.done": "{count} offline behalten",
  "download.alreadyOffline": "Bereits offline verfügbar",
  "download.partial": "{ok} gespeichert, {failed} fehlgeschlagen",

  // Trash confirmation
  "confirm.trashTitle": "In den Papierkorb verschieben?",
  "confirm.trashConfirm": "In den Papierkorb verschieben",
  "confirm.trashCount.one":
    "{count} Foto wird in den Papierkorb verschoben. Du kannst es aus Proton Drive wiederherstellen.",
  "confirm.trashCount.other":
    "{count} Fotos werden in den Papierkorb verschoben. Du kannst sie aus Proton Drive wiederherstellen.",
  "confirm.trashName":
    '"{name}" wird in den Papierkorb verschoben. Du kannst es aus Proton Drive wiederherstellen.',
  "confirm.thisPhoto": "Dieses Foto",
};
