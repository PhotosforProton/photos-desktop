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

// Italian (it) strings. Keys mirror en.ts exactly.
export const it: Record<string, string> = {
  // Common
  "common.cancel": "Annulla",
  "common.close": "Chiudi",
  "common.back": "Indietro",
  "common.loading": "Caricamento…",
  "common.photoCount.one": "{count} foto",
  "common.photoCount.other": "{count} foto",

  // Navigation
  "nav.photos": "Foto",
  "nav.albums": "Album",
  "nav.shared": "Condivisi",

  // App shell
  "app.restoring": "Ripristino della sessione…",
  "update.available": "L'aggiornamento {version} è disponibile",
  "update.now": "Aggiorna",
  "update.updating": "Aggiornamento…",
  "update.failed": "Aggiornamento non riuscito",
  "update.hashError": "Verifica del download non riuscita",
  "menu.reload": "Ricarica",
  "menu.moreSoon": "Altro in arrivo…",
  "menu.quit": "Esci",

  // Tray popup
  "tray.open": "Apri Photos for Proton",
  "tray.syncNow": "Sincronizza ora",
  "tray.syncing": "Sincronizzazione…",
  "tray.synced": "Tutto aggiornato",

  // Login
  "login.subtitle": "Accedi al tuo account Proton",
  "login.emailLabel": "Email o nome utente",
  "login.passwordLabel": "Password",
  "login.passwordPlaceholder": "Password",
  "login.signIn": "Accedi",
  "login.signingIn": "Accesso in corso…",
  "login.twofaLabel": "Codice a due fattori",
  "login.verify": "Verifica",
  "login.verifying": "Verifica in corso…",
  "login.captchaHint": "Proton ti chiede di confermare di essere una persona reale.",
  "login.captchaExpired": "Il captcha è scaduto. Risolvilo di nuovo.",

  // Lock screen (returning cold start)
  "lock.subtitle": "Inserisci la password per sbloccare",
  "lock.unlock": "Sblocca",
  "lock.unlocking": "Sblocco in corso…",
  "lock.wrongPassword": "Password errata",
  "lock.failed": "Sblocco non riuscito. Riprova.",
  "lock.differentAccount": "Usa un altro account",

  // Titlebar
  "titlebar.minimize": "Riduci a icona",
  "titlebar.maximize": "Ingrandisci",

  // Settings
  "settings.title": "Impostazioni",
  "settings.appearance": "Aspetto",
  "settings.theme": "Tema",
  "settings.themeDesc": "Sistema segue Windows e continua a seguirlo quando cambia.",
  "settings.theme.dark": "Scuro",
  "settings.theme.light": "Chiaro",
  "settings.theme.system": "Sistema",
  "settings.palette": "Tavolozza",
  "settings.paletteDesc": "Colore principale usato in tutta l'app.",
  "settings.palette.default": "Predefinita",
  "settings.palette.forest": "Foresta",
  "settings.palette.sunset": "Tramonto",
  "settings.palette.sea": "Mare",
  "settings.palette.sepia": "Seppia",
  "settings.palette.mono": "Mono",
  "settings.palette.amoled": "Nero puro (AMOLED)",
  "settings.language": "Lingua",
  "settings.languageDesc": "Scegli la lingua dell'interfaccia.",
  "settings.timeline": "Sequenza",
  "settings.hideAlbum": "Nascondi le foto negli album Drive",
  "settings.hideAlbumDesc":
    "Le foto aggiunte a un album Drive non appariranno nella tua sequenza principale. Restano visibili nelle schede Album e Condivisi e nei filtri per categoria.",
  "settings.security": "Sicurezza",
  "settings.lockOnHide": "Richiedi la password alla riapertura dall'area di notifica",
  "settings.debug": "Overlay di debug",
  "settings.debugDesc": "Mostra un HUD della memoria in tempo reale (dimensioni di heap e cache).",
  "settings.explorer": "Esplora file",
  "settings.showInExplorer": 'Mostra "Proton Photos" in Esplora file',
  "settings.showInExplorerDesc":
    "Aggiunge una voce Proton Photos alla barra laterale di Esplora file con le tue foto del cloud. Ha effetto dopo un riavvio.",
  "settings.autoDownload": "Scarica automaticamente le nuove foto",
  "settings.autoDownloadDesc":
    "Man mano che nuove foto vengono aggiunte alla tua libreria, mantiene automaticamente una copia su questo dispositivo.",
  "settings.restartNeeded": "Riavvia per applicare questa modifica.",
  "settings.restartNow": "Riavvia ora",
  "settings.lockOnHideDesc":
    "Quando la finestra viene chiusa nell'area di notifica, l'app si blocca e chiede la password alla successiva apertura.",

  // Profile menu
  "profile.storage": "Spazio",
  "profile.used": "{size} usati",
  "profile.total": "{size} totali",
  "profile.signOut": "Disconnetti",

  // Avatar
  "avatar.uploading": "Caricamento",
  "avatar.syncing": "Sincronizzazione",
  "avatar.account": "Account e impostazioni",
  "avatar.showUploads": "Mostra caricamenti",

  // Photos view
  "photos.all": "Tutte",
  "photos.search": "Cerca",
  "photos.searchPlaceholder": "Cerca per nome file o tipo…",
  "photos.closeSearch": "Chiudi ricerca",
  "photos.smaller": "Più piccole",
  "photos.bigger": "Più grandi",
  "photos.indexing": "Indicizzazione {done}/{total}",
  "photos.uploadTitle": "Carica foto o una cartella come album",
  "photos.uploadingProgress": "Caricamento {progress}",
  "photos.noMatches": "Nessun risultato",
  "photos.noPhotos": "Ancora nessuna foto",
  "photos.noPhotosSub": "Le tue foto appariranno qui dopo la sincronizzazione.",
  "photos.stillIndexing": "Indicizzazione in corso, appariranno altri risultati.",
  "photos.loadingThumbnails": "Caricamento miniature…",
  "photos.dropTitle": "Rilascia per caricare",
  "photos.dropSub": "Una cartella diventa un album con lo stesso nome",
  "photos.offline": "Disponibile offline",

  // Search type filters
  "filter.images": "Immagini",
  "filter.videos": "Video",

  // Filter panel
  "filter.title": "Filtro",
  "filter.categories": "Categorie",
  "filter.type": "Tipo",
  "filter.mediaAll": "Tutti",
  "filter.mediaPhotos": "Foto",
  "filter.reset": "Reimposta",

  // Categories
  "category.fav": "Preferiti",
  "category.screen": "Screenshot",
  "category.video": "Video",
  "category.live": "Live Photos",
  "category.selfie": "Selfie",
  "category.portrait": "Ritratti",
  "category.burst": "Scatti continui",
  "category.pano": "Panorami",
  "category.raw": "RAW",

  // Albums
  "albums.backToAlbums": "Torna agli album",
  "albums.untitled": "Album senza titolo",
  "albums.empty": "Questo album è vuoto",
  "albums.none": "Ancora nessun album",
  "albums.noneSub": "Trascina una cartella sulla finestra per crearne uno.",
  "albums.keepOffline": "Mantieni questo album su questo dispositivo",
  "albums.keptOffline": "Mantenuto su questo dispositivo (clicca per interrompere)",

  // Shared
  "shared.byMe": "Condivisi da me",
  "shared.withMe": "Condivisi con me",
  "shared.emptyByTitle": "Non stai condividendo nulla",
  "shared.emptyWithTitle": "Nulla condiviso con te",
  "shared.emptyBySub": "Le foto e gli album che condividi appariranno qui.",
  "shared.emptyWithSub": "Le foto e gli album che altri condividono con te appariranno qui.",
  "shared.publicLink": "Condivisi tramite link pubblico",
  "shared.album": "Album",

  // Photo viewer / lightbox
  "viewer.details": "Dettagli",
  "viewer.download": "Mantieni offline",
  "viewer.freeUp": "Libera spazio",
  "viewer.detailsShortcut": "Dettagli (I)",
  "viewer.trashShortcut": "Sposta nel cestino (Del)",
  "viewer.rename": "Clicca per rinominare",
  "viewer.closeShortcut": "Chiudi (Esc)",
  "viewer.prev": "Precedente (←)",
  "viewer.next": "Successiva (→)",
  "viewer.name": "Nome",
  "viewer.type": "Tipo",
  "viewer.dimensions": "Dimensioni",
  "viewer.taken": "Scattata",
  "viewer.added": "Aggiunta",
  "viewer.modified": "Modificata",
  "viewer.size": "Dimensione",
  "viewer.onServer": "Sul server",
  "viewer.albums": "Album",
  "viewer.shared": "Condivisa",
  "viewer.sharedPublic": "Link pubblico",
  "viewer.sharedPeople": "Con persone",
  "viewer.sharedNo": "No",
  "viewer.unverified": " (non verificata)",
  "viewer.trashFailed": "impossibile spostare nel cestino",
  "viewer.zoomOut": "Riduci zoom",
  "viewer.zoomIn": "Aumenta zoom",
  "viewer.resetFit": "Adatta alla finestra",
  "viewer.videoLoading": "Caricamento video…",
  "viewer.videoError": "Questo formato video non può essere riprodotto qui. Scaricalo per guardarlo.",
  "viewer.videoTooLarge": "Questo video è troppo grande per essere riprodotto qui. Scaricalo per guardarlo.",

  // Upload panel
  "upload.title": "Caricamento",
  "upload.filterName": "Foto e video",
  "upload.dropHint": "Trascina foto o una cartella in un punto qualsiasi della finestra",
  "upload.dropSub":
    "Le foto vanno direttamente nella tua sequenza. Una cartella diventa un album con lo stesso nome.",
  "upload.chooseFiles": "Scegli file",
  "upload.chooseFolder": "Scegli cartella",
  "upload.alreadyThere": "{count} già presenti",
  "upload.failedCount": "{count} non riuscite",
  "upload.clear": "Cancella",
  "upload.statusUploading": "caricamento…",
  "upload.statusSkipped": "ignorato",
  "upload.statusQueued": "in coda",
  "upload.statusFailed": "non riuscito",

  // Grid tile
  "grid.select": "Seleziona",
  "grid.deselect": "Deseleziona",

  // Selection bar
  "selection.cancel": "Annulla selezione (Esc)",
  "selection.count.one": "{count} foto selezionata",
  "selection.count.other": "{count} foto selezionate",
  "selection.trash": "Cestina",
  "selection.download": "Scarica",
  "selection.freeUp": "Libera spazio",
  "download.freedUp": "{count} liberate",
  "download.notDownloaded": "Niente da liberare",
  "download.running": "Download in corso…",
  "download.done": "{count} mantenute offline",
  "download.alreadyOffline": "Già disponibile offline",
  "download.partial": "Salvate {ok}, {failed} non riuscite",

  // Trash confirmation
  "confirm.trashTitle": "Spostare nel cestino?",
  "confirm.trashConfirm": "Sposta nel cestino",
  "confirm.trashCount.one":
    "{count} foto verrà spostata nel cestino. Puoi ripristinarla da Proton Drive.",
  "confirm.trashCount.other":
    "{count} foto verranno spostate nel cestino. Puoi ripristinarle da Proton Drive.",
  "confirm.trashName":
    '"{name}" verrà spostata nel cestino. Puoi ripristinarla da Proton Drive.',
  "confirm.thisPhoto": "Questa foto",
};
