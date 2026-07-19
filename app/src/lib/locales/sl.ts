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
  "nav.trash": "Koš",

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
  "tray.locked": "Zaklenjeno",
  "tray.lockedHint": "Odpri za odklep",
  "tray.signedOut": "Nisi prijavljen",
  "tray.signedOutHint": "Odpri za prijavo",

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
  "settings.general": "Splošno",
  "settings.launchAtLogin": "Zaženi z Windows",
  "settings.launchAtLoginDesc": "Ob prijavi v Windows se zažene v ozadju in prikaže samo ikono v sistemski vrstici, dokler je ne odprete.",
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
    "Ko se v tvojo knjižnico dodajo nove fotografije, jih samodejno prenesi v mapo Proton Photos.",
  "settings.autoDownloadNeedsExplorer":
    'Deluje samo z "Proton Photos" v Raziskovalcu, kar je izklopljeno. Prenos še vedno deluje: vpraša te, kam naj shrani fotografije.',
  "settings.restartNeeded": "Za uveljavitev te spremembe znova zaženi aplikacijo.",
  "settings.restartNow": "Znova zaženi zdaj",
  // File types. The "Open with" entries are the app's own to add and take back out;
  // the default handler is not, so that half leads out to Windows rather than
  // pretending to a choice Windows takes from the user alone.
  "settings.fileTypes": "Vrste datotek",
  "settings.openWith": 'Dodaj na seznam "Odpri z"',
  "settings.openWithDesc":
    'Photos for Proton se prikaže v Windowsovem meniju "Odpri z" pri fotografijah JPEG, PNG, GIF, WebP, AVIF, BMP, TIFF in HEIC ter pri videoposnetkih MP4, MOV, M4V in WebM. Ob izklopu se vnosi spet odstranijo.',
  "settings.fileTypesFailed": "Vrst datotek ni bilo mogoče spremeniti. Poskusi znova.",
  "settings.defaultApp": "Privzeta aplikacija za fotografije in videoposnetke",
  "settings.defaultAppDesc":
    "Tako nič ne postane privzeto: to izbiro Windows sprejme samo od tebe, nikoli od programa. V nastavitvah Windows pod Privzete aplikacije izberi Photos for Proton.",
  "settings.defaultAppOpen": "Odpri nastavitve Windows",
  "settings.defaultAppFailed": "Nastavitev Windows ni bilo mogoče odpreti. Poskusi znova.",
  "settings.lockOnHideDesc":
    "Ko okno skriješ v sistemsko vrstico, se aplikacija zaklene in ob naslednjem odpiranju vpraša za geslo.",
  "settings.storage": "Shramba",
  // Two different places a photo can be kept on this machine: encrypted inside the
  // app, or downloaded into the Proton Photos folder where Windows can read it. The
  // panel names both rather than adding one number to the other.
  "settings.downloadedCount.one": "{count} prenesena fotografija",
  "settings.downloadedCount.other": "{count} prenesenih fotografij",
  "settings.downloadedNone": "Nič ni preneseno",
  "settings.downloadedDesc":
    "Prenesene fotografije so navadne datoteke v mapi Proton Photos, zato jih lahko prebere iskanje Windows in drugi programi. Sproščanje odstrani samo te lokalne kopije, tvoje fotografije pa ostanejo v Protonu.",
  "settings.freeUpAll": "Sprosti {size}",
  "settings.freeUpNothing": "Ni česa sprostiti",
  "settings.freeingUp": "Sproščanje…",
  "settings.storageOffline": "Fotografije brez povezave",
  "settings.storageExplorer": "V Raziskovalcu",
  "settings.offlineCount.one": "{count} fotografija v aplikaciji",
  "settings.offlineCount.other": "{count} fotografij v aplikaciji",
  "settings.offlineNone": "V aplikaciji ni shranjenih fotografij",
  "settings.offlineDesc":
    "Fotografije, ki jih označiš kot na voljo brez povezave, ostanejo šifrirane v aplikaciji. Odprejo se tudi brez povezave in se nikoli ne prikažejo v mapi Proton Photos, zato jih nič zunaj aplikacije ne more prebrati.",
  "settings.offlineSaving": "Shranjevanje {done}/{total}…",
  "settings.offlineRemoveAll": "Sprosti {size}",
  "settings.offlineRemoveNothing": "Ni česa sprostiti",
  "settings.offlineRemoving": "Odstranjevanje…",
  "settings.freeUpFailed": "Prostora ni bilo mogoče sprostiti. Poskusi znova.",

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
  "photos.offline": "Na voljo brez povezave, šifrirano v aplikaciji",
  "photos.downloaded": "Preneseno v mapo Proton Photos",
  "photos.renameTitle": "Preimenuj fotografijo",
  "photos.namePlaceholder": "Ime datoteke",

  // Tile badges
  "badge.motionPhoto": "Gibljiva fotografija",
  "badge.panorama": "Panorama",
  "badge.raw": "RAW",
  "badge.favorite": "Priljubljeno",

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
  "albums.noneSub": "Ustvari ga tukaj ali spusti mapo na okno.",
  "albums.keepDownloaded": "Prenesi ta album v mapo Proton Photos",
  "albums.keptDownloaded": "Prenašanje v mapo Proton Photos (klikni za ustavitev)",
  "albums.freeUpTitle": "Sprostim prostor tega albuma?",
  "albums.freeUpCount.one":
    "Album se ne prenaša več sam. {count} fotografija je že v mapi Proton Photos in lahko ostane, ali pa sprostiš prostor, ki ga zaseda. V obeh primerih ostane v Protonu.",
  "albums.freeUpCount.other":
    "Album se ne prenaša več sam. {count} fotografij je že v mapi Proton Photos in lahko ostanejo, ali pa sprostiš prostor, ki ga zasedajo. V obeh primerih ostanejo v Protonu.",
  "albums.freeUpKeep": "Obdrži preneseno",
  "albums.freeUpConfirm": "Sprosti",
  "albums.newAlbum": "Nov album",
  "albums.newTitle": "Poimenuj album",
  "albums.namePlaceholder": "Ime albuma",
  "albums.create": "Ustvari",
  "albums.createAndAdd": "Ustvari in dodaj",
  "albums.rename": "Preimenuj",
  "albums.renameTitle": "Preimenuj album",
  "albums.share": "Deli album",
  "albums.delete": "Izbriši album",
  "albums.deleted": "Album izbrisan",
  "albums.addTitle": "Dodaj v album",
  "albums.addCount.one": "Izberi, kam naj gre {count} fotografija.",
  "albums.addCount.other": "Izberi, kam naj gredo fotografije ({count}).",
  "albums.added": "{count} dodanih",
  "albums.addPartial": "Dodanih {ok}, {failed} ni uspelo",
  "albums.removed": "{count} odstranjenih iz albuma",
  "albums.removePartial": "Odstranjenih {ok}, {failed} ni uspelo",
  "albums.coverSet": "Naslovnica posodobljena",
  "albums.strandedTitle.one": "{count} fotografija je samo v tem albumu",
  "albums.strandedTitle.other": "Samo v tem albumu so fotografije ({count})",
  "albums.strandedMsg.one":
    "Ni na tvoji časovnici, zato se z brisanjem albuma izbriše tudi ona. Shrani jo na časovnico, da jo obdržiš.",
  "albums.strandedMsg.other":
    "Niso na tvoji časovnici, zato se z brisanjem albuma izbrišejo tudi one. Shrani jih na časovnico, da jih obdržiš.",
  "albums.savePhotos": "Shrani na časovnico",
  "albums.deletePhotosToo": "Izbriši tudi fotografije",

  // Shared
  "shared.byMe": "Deljeno z drugimi",
  "shared.withMe": "Deljeno z mano",
  "shared.flip": "Preklopi med deljenim z drugimi in deljenim z mano",
  "shared.emptyByTitle": "Ničesar ne deliš",
  "shared.emptyWithTitle": "Nič ni deljeno s tabo",
  "shared.emptyBySub": "Fotografije in albumi, ki jih deliš, se prikažejo tukaj.",
  "shared.emptyWithSub": "Fotografije in albumi, ki jih drugi delijo s tabo, se prikažejo tukaj.",
  "shared.publicLink": "Deljeno prek javne povezave",
  "shared.album": "Album",
  "shared.manage": "Upravljanje deljenja",
  "shared.back": "Nazaj v skupno rabo",

  // Share dialog. A public link's URL carries the secret that decrypts what it
  // points at, so copying it whole is the whole point of the link section. A
  // link's password is never read back, so the dialog reports whether one is set
  // rather than showing it.
  "share.title": "Deljenje",
  "share.linkTitle": "Javna povezava",
  "share.linkDesc": "To fotografijo lahko odpre vsak, ki ima povezavo.",
  "share.createLink": "Ustvari povezavo",
  "share.copyLink": "Kopiraj povezavo",
  "share.copied": "Kopirano",
  "share.removeLink": "Odstrani povezavo",
  "share.passwordLabel": "Geslo",
  "share.passwordSet": "Potrebno za odpiranje",
  "share.passwordNone": "Ni nastavljeno",
  "share.passwordPlaceholder": "Novo geslo",
  "share.expiryLabel": "Poteče",
  "share.expiryNever": "Nikoli",
  "share.expiryPast": "Izberi datum v prihodnosti.",
  "share.add": "Dodaj",
  "share.change": "Spremeni",
  "share.set": "Nastavi",
  "share.save": "Shrani",
  "share.albumInviteOnly": "Albume deliš s povabilom, ne z javno povezavo.",
  "share.peopleTitle": "Osebe",
  "share.emailPlaceholder": "E-poštni naslov",
  "share.invite": "Povabi",
  "share.roleViewer": "Bralec",
  "share.roleEditor": "Urejevalec",
  "share.stateInvited": "Povabljen",
  "share.stateExternal": "Povabljen (brez računa Proton)",
  "share.remove": "Odstrani",
  "share.noPeople": "Zaenkrat nikogar",
  "share.stopSharing": "Ustavi deljenje",
  "share.notOwned": "To je bilo deljeno s teboj. Kdo lahko dostopa, lahko spremeni samo lastnik.",
  "share.badEmail": "To ni videti kot e-poštni naslov.",
  "share.copyFailed": "Povezave ni bilo mogoče kopirati",
  "share.failed": "Deljenja ni bilo mogoče spremeniti",
  "share.working": "Poteka…",

  // Trash
  "trash.emptyTitle": "Koš je prazen",
  "trash.emptySub": "Fotografije, ki jih premakneš v koš, se prikažejo tukaj in jih lahko obnoviš.",
  "trash.emptyAction": "Izprazni koš",
  "trash.moved": "{count} premaknjenih v koš",
  "trash.movedPartial": "{ok} premaknjenih v koš, {failed} ni uspelo",
  "trash.restored": "{count} obnovljenih",
  "trash.deleted": "{count} trajno izbrisanih",
  "trash.emptied": "Koš izpraznjen",
  "trash.partial": "{ok} končanih, {failed} ni uspelo",

  // Photo viewer / lightbox
  "viewer.details": "Podrobnosti",
  "viewer.offlineAdd": "Obdrži kopijo brez povezave, šifrirano v aplikaciji",
  "viewer.offlineRemove": "Odstrani kopijo brez povezave",
  "viewer.download": "Prenesi v mapo Proton Photos",
  "viewer.saveToFolder": "Shrani kopijo, kamor želiš",
  "viewer.freeUp": "Odstrani lokalno kopijo in sprosti prostor",
  "viewer.detailsShortcut": "Podrobnosti (I)",
  "viewer.contents": "Vsebina",
  "viewer.contentsShortcut": "Vsebina (L)",
  "viewer.filmstrip": "Sosednji elementi",
  "viewer.position": "{n} od {total}",
  "viewer.favoriteShortcut": "Dodaj med priljubljene (F)",
  "viewer.unfavoriteShortcut": "Odstrani iz priljubljenih (F)",
  "viewer.trashShortcut": "Premakni v koš (Del)",
  "viewer.shareShortcut": "Deli (S)",
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
  "viewer.onServer": "Porabljen prostor",
  "viewer.albums": "Albumi",
  "viewer.shared": "V skupni rabi",
  "viewer.sharedPublic": "Javna povezava",
  "viewer.sharedPeople": "Z ljudmi",
  "viewer.sharedNo": "Ne",
  "viewer.unverified": " (nepreverjeno)",
  "viewer.trashFailed": "Te fotografije ni bilo mogoče premakniti v koš.",
  "viewer.favoriteFailed": "Priljubljenih ni bilo mogoče posodobiti.",
  "viewer.downloadFailed": "Te fotografije ni bilo mogoče prenesti.",
  "viewer.zoomOut": "Oddalji",
  "viewer.zoomIn": "Približaj",
  "viewer.resetFit": "Ponastavi povečavo",
  "viewer.videoLoading": "Nalaganje videa…",
  "viewer.videoError":
    "Tega formata videa tukaj ni mogoče predvajati. Prenesi ga in si ga oglej v drugem predvajalniku.",
  "viewer.videoTooLarge":
    "Ta video je prevelik za predvajanje tukaj. Prenesi ga in si ga oglej v drugem predvajalniku.",

  // The viewer's own video controls, which stand in for the browser's.
  "viewer.videoPlay": "Predvajaj (preslednica)",
  "viewer.videoPause": "Premor (preslednica)",
  "viewer.videoStepBack": "Prejšnja sličica",
  "viewer.videoStepForward": "Naslednja sličica",
  "viewer.videoSeek": "Položaj predvajanja",
  "viewer.videoMute": "Utišaj",
  "viewer.videoUnmute": "Vklopi zvok",

  // Local file viewer: a file opened from File Explorer, which the app can show
  // with nobody signed in. Everything both viewers say alike comes from above.
  "local.camera": "Fotoaparat",
  "local.created": "Ustvarjeno",
  "local.path": "Lokacija",
  "local.upload": "Naloži v Proton",
  "local.uploadUnsupported": "Proton ne sprejema te vrste datoteke",
  "local.uploading": "Nalaganje…",
  "local.uploaded": "Shranjeno v Proton",
  "local.uploadSkipped": "Že shranjeno",
  "local.uploadFailed": "Nalaganje ni uspelo. Poskusi znova.",
  "local.delete": "Izbriši",
  "local.deleteTitle": "Želite izbrisati to datoteko?",
  "local.deleteMessage": "Datoteka »{name}« bo premaknjena v koš.",
  "local.notFound": "Ta datoteka je bila premaknjena ali izbrisana.",
  "local.unreadable":
    "Te datoteke ni bilo mogoče prebrati. Morda jo ima odprto drug program ali pa je zunaj dosega tega računa.",
  "local.openFailed": "Te datoteke ni bilo mogoče odpreti.",
  "local.decodeFailed":
    "Te fotografije ni bilo mogoče prebrati. Datoteka je morda poškodovana ali nepopolna.",
  "local.videoUnsupported":
    "Tega formata videa tukaj ni mogoče predvajati. Odpri ga v drugem predvajalniku.",
  "local.noCodec":
    "Windows nima dekodirnika za ta format, zato ga tukaj ni mogoče prikazati. V Microsoft Storu je to, kar pri nekaterih manjka: razširitvi HEIF in HEVC za fotografije HEIC ter Raw Image Extension za surove datoteke iz fotoaparatov.",
  "local.signInTitle": "Prijava za nalaganje",
  "local.signInBody":
    "Odpre se okno aplikacije, kjer se lahko prijaviš. Ta datoteka ostane odprta tukaj.",
  "local.signInAction": "Prijava",

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
  "selection.restore": "Obnovi",
  "selection.deleteForever": "Trajno izbriši",
  "selection.more": "Več",
  "selection.download": "Prenesi",
  "selection.freeUp": "Sprosti",
  "selection.addToAlbum": "Dodaj v album",
  "selection.removeFromAlbum": "Odstrani iz albuma",
  "selection.setCover": "Nastavi kot naslovnico",
  "selection.rename": "Preimenuj",
  "selection.share": "Deli",
  "selection.favorite": "Dodaj med priljubljene",
  "selection.unfavorite": "Odstrani iz priljubljenih",
  "selection.offlineAdd": "Na voljo brez povezave",
  "selection.offlineRemove": "Odstrani kopijo brez povezave",
  // Download: the copy that lands in the Proton Photos folder, where Windows and any
  // other program can read it. Never called offline, which is the app's own copy.
  "download.freedUp": "{count} sproščenih",
  "download.freedUpNone": "Nič ni bilo sproščeno",
  "download.notDownloaded": "Ni prenesenega za sprostitev",
  "download.running": "Prenašanje…",
  "download.progress": "Prenašanje {done}/{total}…",
  "download.done": "{count} prenesenih v mapo Proton Photos",
  "download.donePartial": "{ok} od {total} prenesenih",
  "download.doneNone":
    "Nič ni bilo prenesenega. Mapa Proton Photos morda še ni pripravljena.",
  "download.alreadyDownloaded": "Že preneseno",
  "download.saved": "{count} shranjenih v mapo",
  "download.partial": "Shranjenih {ok}, {failed} ni uspelo",

  // Available offline: the app's own encrypted copy, which is not the Proton Photos
  // folder. These say where the copy went, so the two are never mistaken for one another.
  "offline.added.one": "{count} fotografija se shranjuje za uporabo brez povezave",
  "offline.added.other": "{count} fotografij se shranjuje za uporabo brez povezave",
  "offline.removed.one": "{count} kopija brez povezave odstranjena",
  "offline.removed.other": "{count} kopij brez povezave odstranjenih",
  "offline.alreadyOffline": "Že na voljo brez povezave",
  "offline.noneOffline": "Ni kopij brez povezave za odstranitev",
  "offline.failed": "shranjevanje za uporabo brez povezave ni uspelo",

  // Trash confirmation
  "confirm.trashTitle": "Premakniti v koš?",
  "confirm.trashConfirm": "Premakni v koš",
  "confirm.trashCount.one":
    "{count} fotografija bo premaknjena v koš. Obnoviš jo lahko na zavihku Koš.",
  "confirm.trashCount.other":
    "{count} fotografij bo premaknjenih v koš. Obnoviš jih lahko na zavihku Koš.",
  "confirm.trashName":
    '"{name}" bo premaknjena v koš. Obnoviš jo lahko na zavihku Koš.',
  "confirm.thisPhoto": "Ta fotografija",

  // Remove from album. The photos stay in Photos; only the album loses them.
  "confirm.removeTitle": "Odstrani iz albuma?",
  "confirm.removeConfirm": "Odstrani",
  "confirm.removeCount.one":
    "{count} fotografija bo šla iz tega albuma in ostala na tvoji časovnici.",
  "confirm.removeCount.other":
    "Fotografije ({count}) bodo šle iz tega albuma in ostale na tvoji časovnici.",

  // Delete-forever confirmation. Nothing in the app or at Proton undoes these.
  "confirm.deleteTitle": "Trajno izbrisati?",
  "confirm.deleteConfirm": "Trajno izbriši",
  "confirm.deleteCount.one":
    "{count} fotografija bo trajno izbrisana iz Protona. Tega ni mogoče razveljaviti.",
  "confirm.deleteCount.other":
    "{count} fotografij bo trajno izbrisanih iz Protona. Tega ni mogoče razveljaviti.",
  "confirm.emptyTitle": "Izprazniti koš?",
  "confirm.emptyConfirm": "Izbriši vse",
  "confirm.emptyMessage":
    "Vsa vsebina koša bo trajno izbrisana iz Protona. Tega ni mogoče razveljaviti.",

  // Deleting an album skips the trash, so the album is gone for good even though
  // the photos in your timeline are not.
  "confirm.deleteAlbumTitle": "Izbrišem ta album?",
  "confirm.deleteAlbumMessage":
    "Album bo izbrisan in ga ni mogoče obnoviti. Fotografije na tvoji časovnici ostanejo.",

  // Revoking sharing takes access away from people who may already hold the link,
  // and nothing is deleted by it, so both of these say exactly what is lost.
  "confirm.removeLinkTitle": "Odstranim povezavo?",
  "confirm.removeLinkMessage":
    "Povezava preneha delovati za vse, ki jo imajo. Osebe, povabljene po e-pošti, obdržijo dostop.",
  "confirm.removeLinkConfirm": "Odstrani povezavo",
  "confirm.replaceLinkTitle": "Zamenjam povezavo?",
  "confirm.replaceLinkMessage":
    "Ta povezava je prestara, da bi jo bilo mogoče spremeniti, zato jo shranjevanje zamenja z novo na drugem naslovu. Stara povezava preneha delovati za vse, ki jo imajo, njeno geslo pa se izbriše. Nova povezava se skopira v odložišče.",
  "confirm.replaceLinkConfirm": "Zamenjaj povezavo",
  "confirm.stopSharingTitle": "Ustavim deljenje?",
  "confirm.stopSharingMessage":
    "Povezava preneha delovati in vse povabljene osebe izgubijo dostop. Nič se ne izbriše.",
  "confirm.stopSharingConfirm": "Ustavi deljenje",

  // Freeing up drops the downloaded copies only. Nothing leaves Proton, so this asks
  // before a big change without treating it as one there is no way back from.
  "confirm.freeUpAllTitle": "Sprostim vse prenesene fotografije?",
  "confirm.freeUpAllMessage":
    "{size} v mapi Proton Photos bo odstranjenih. Tvoje fotografije ostanejo v Protonu in se znova prenesejo, ko jih odpreš.",
  "confirm.freeUpAllConfirm": "Sprosti",

  // Removing every offline copy. The photos themselves are untouched, so this warns
  // about the download they will need next time and nothing more.
  "confirm.removeOfflineAllTitle": "Odstranim vse kopije brez povezave?",
  "confirm.removeOfflineAllMessage":
    "{size}, shranjenih šifrirano v aplikaciji, bo odstranjenih. Tvoje fotografije ostanejo v Protonu, za vnovično odpiranje pa bo potrebna povezava.",
  "confirm.removeOfflineAllConfirm": "Odstrani",
};
