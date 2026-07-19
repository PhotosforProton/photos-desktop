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

// French (fr) strings. Keys mirror en.ts exactly.
export const fr: Record<string, string> = {
  // Common
  "common.cancel": "Annuler",
  "common.close": "Fermer",
  "common.back": "Retour",
  "common.loading": "Chargement…",
  "common.photoCount.one": "{count} photo",
  "common.photoCount.other": "{count} photos",

  // Navigation
  "nav.photos": "Photos",
  "nav.albums": "Albums",
  "nav.shared": "Partagés",
  "nav.trash": "Corbeille",

  // App shell
  "app.restoring": "Restauration de la session…",
  "update.available": "La mise à jour {version} est disponible",
  "update.now": "Mettre à jour",
  "update.updating": "Mise à jour…",
  "update.failed": "Échec de la mise à jour",
  "update.hashError": "Échec de la vérification du téléchargement",
  "menu.reload": "Recharger",
  "menu.moreSoon": "D'autres bientôt…",
  "menu.quit": "Quitter",

  // Tray popup
  "tray.open": "Ouvrir Photos for Proton",
  "tray.syncNow": "Synchroniser maintenant",
  "tray.syncing": "Synchronisation…",
  "tray.synced": "À jour",
  "tray.locked": "Verrouillé",
  "tray.lockedHint": "Ouvrez pour déverrouiller",
  "tray.signedOut": "Non connecté",
  "tray.signedOutHint": "Ouvrez pour vous connecter",

  // Login
  "login.subtitle": "Connectez-vous à votre compte Proton",
  "login.emailLabel": "E-mail ou nom d'utilisateur",
  "login.passwordLabel": "Mot de passe",
  "login.passwordPlaceholder": "Mot de passe",
  "login.signIn": "Se connecter",
  "login.signingIn": "Connexion…",
  "login.twofaLabel": "Code à deux facteurs",
  "login.verify": "Vérifier",
  "login.verifying": "Vérification…",
  "login.captchaHint": "Proton vous demande de confirmer que vous êtes bien humain.",
  "login.captchaExpired": "Le captcha a expiré. Veuillez le résoudre à nouveau.",

  // Lock screen (returning cold start)
  "lock.subtitle": "Saisissez votre mot de passe pour déverrouiller",
  "lock.unlock": "Déverrouiller",
  "lock.unlocking": "Déverrouillage…",
  "lock.wrongPassword": "Mot de passe incorrect",
  "lock.failed": "Déverrouillage impossible. Veuillez réessayer.",
  "lock.differentAccount": "Utiliser un autre compte",

  // Titlebar
  "titlebar.minimize": "Réduire",
  "titlebar.maximize": "Agrandir",

  // Settings
  "settings.title": "Paramètres",
  "settings.general": "Général",
  "settings.launchAtLogin": "Démarrer avec Windows",
  "settings.launchAtLoginDesc": "Démarre en arrière-plan à l'ouverture de session Windows, en n'affichant que l'icône de la zone de notification jusqu'à son ouverture.",
  "settings.appearance": "Apparence",
  "settings.theme": "Thème",
  "settings.themeDesc": "Le mode Système suit Windows et continue de s'y adapter au fil des changements.",
  "settings.theme.dark": "Sombre",
  "settings.theme.light": "Clair",
  "settings.theme.system": "Système",
  "settings.palette": "Palette",
  "settings.paletteDesc": "Couleur d'accent utilisée dans toute l'application.",
  "settings.palette.default": "Par défaut",
  "settings.palette.forest": "Forêt",
  "settings.palette.sunset": "Coucher de soleil",
  "settings.palette.sea": "Mer",
  "settings.palette.sepia": "Sépia",
  "settings.palette.mono": "Mono",
  "settings.palette.amoled": "Noir pur (AMOLED)",
  "settings.language": "Langue",
  "settings.languageDesc": "Choisissez la langue d'affichage.",
  "settings.timeline": "Fil",
  "settings.hideAlbum": "Masquer les photos des albums Drive",
  "settings.hideAlbumDesc":
    "Les photos ajoutées à un album Drive n'apparaissent pas dans votre fil principal. Elles restent visibles dans les onglets Albums et Partagés, ainsi que dans les filtres de catégories.",
  "settings.security": "Sécurité",
  "settings.lockOnHide": "Exiger le mot de passe à la réouverture depuis la zone de notification",
  "settings.debug": "Superposition de débogage",
  "settings.debugDesc": "Affiche un indicateur de mémoire en direct (taille du tas et du cache).",
  "settings.explorer": "Explorateur de fichiers",
  "settings.showInExplorer": "Afficher « Proton Photos » dans l'Explorateur de fichiers",
  "settings.showInExplorerDesc":
    "Ajoute une entrée Proton Photos dans le volet latéral de l'Explorateur, avec vos photos du cloud. Prend effet après un redémarrage.",
  "settings.autoDownload": "Télécharger automatiquement les nouvelles photos",
  "settings.autoDownloadDesc":
    "À mesure que de nouvelles photos sont ajoutées à votre bibliothèque, elles sont téléchargées automatiquement dans le dossier Proton Photos.",
  "settings.autoDownloadNeedsExplorer":
    "Fonctionne uniquement avec « Proton Photos » dans l'Explorateur de fichiers, qui est désactivé. Le téléchargement fonctionne toujours : il vous demande où enregistrer vos photos.",
  "settings.restartNeeded": "Redémarrez pour appliquer ce changement.",
  "settings.restartNow": "Redémarrer maintenant",
  // File types. The "Open with" entries are the app's own to add and take back out;
  // the default handler is not, so that half leads out to Windows rather than
  // pretending to a choice Windows takes from the user alone.
  "settings.fileTypes": "Types de fichiers",
  "settings.openWith": "Ajouter à la liste « Ouvrir avec »",
  "settings.openWithDesc":
    "Affiche Photos for Proton dans le menu « Ouvrir avec » de Windows pour les photos JPEG, PNG, GIF, WebP, AVIF, BMP, TIFF et HEIC, et pour les vidéos MP4, MOV, M4V et WebM. En désactivant cette option, les entrées sont retirées.",
  "settings.fileTypesFailed": "Impossible de modifier les types de fichiers. Veuillez réessayer.",
  "settings.defaultApp": "Application par défaut pour les photos et les vidéos",
  "settings.defaultAppDesc":
    "Rien ne devient l'application par défaut ainsi : Windows n'accepte ce choix que de vous, jamais d'un programme. Choisissez Photos for Proton dans les paramètres Windows, sous Applications par défaut.",
  "settings.defaultAppOpen": "Ouvrir les paramètres Windows",
  "settings.defaultAppFailed": "Impossible d'ouvrir les paramètres Windows. Veuillez réessayer.",
  "settings.lockOnHideDesc":
    "Lorsque la fenêtre est réduite dans la zone de notification, l'application se verrouille et demande votre mot de passe à la prochaine ouverture.",
  "settings.storage": "Stockage",
  // Two different places a photo can be kept on this machine: encrypted inside the
  // app, or downloaded into the Proton Photos folder where Windows can read it. The
  // panel names both rather than adding one number to the other.
  "settings.downloadedCount.one": "{count} photo téléchargée",
  "settings.downloadedCount.other": "{count} photos téléchargées",
  "settings.downloadedNone": "Aucune photo téléchargée",
  "settings.downloadedDesc":
    "Les photos téléchargées sont des fichiers ordinaires du dossier Proton Photos, lisibles par la recherche Windows et par d'autres programmes. Libérer de l'espace ne supprime que ces copies locales, et vos photos restent dans Proton.",
  "settings.freeUpAll": "Libérer {size}",
  "settings.freeUpNothing": "Rien à libérer",
  "settings.freeingUp": "Libération en cours…",
  "settings.storageOffline": "Photos hors ligne",
  "settings.storageExplorer": "Dans l'Explorateur de fichiers",
  "settings.offlineCount.one": "{count} photo conservée dans l'application",
  "settings.offlineCount.other": "{count} photos conservées dans l'application",
  "settings.offlineNone": "Aucune photo conservée dans l'application",
  "settings.offlineDesc":
    "Les photos que vous marquez comme disponibles hors ligne restent chiffrées dans l'application. Elles s'ouvrent sans connexion et n'apparaissent jamais dans le dossier Proton Photos, donc rien en dehors de l'application ne peut les lire.",
  "settings.offlineSaving": "Enregistrement {done}/{total}…",
  "settings.offlineRemoveAll": "Libérer {size}",
  "settings.offlineRemoveNothing": "Rien à libérer",
  "settings.offlineRemoving": "Suppression en cours…",
  "settings.freeUpFailed": "Impossible de libérer l'espace. Veuillez réessayer.",

  // Profile menu
  "profile.storage": "Stockage",
  "profile.used": "{size} utilisé",
  "profile.total": "{size} au total",
  "profile.signOut": "Se déconnecter",

  // Avatar
  "avatar.uploading": "Envoi en cours",
  "avatar.syncing": "Synchronisation",
  "avatar.account": "Compte et paramètres",
  "avatar.showUploads": "Afficher les envois",

  // Photos view
  "photos.all": "Tout",
  "photos.search": "Rechercher",
  "photos.searchPlaceholder": "Rechercher par nom de fichier ou type…",
  "photos.closeSearch": "Fermer la recherche",
  "photos.indexing": "Indexation {done}/{total}",
  "photos.uploadTitle": "Envoyer des photos, ou un dossier en tant qu'album",
  "photos.uploadingProgress": "Envoi {progress}",
  "photos.noMatches": "Aucun résultat",
  "photos.noPhotos": "Aucune photo pour l'instant",
  "photos.noPhotosSub": "Vos photos apparaîtront ici après la synchronisation.",
  "photos.stillIndexing": "Indexation en cours, d'autres résultats vont apparaître.",
  "photos.loadingThumbnails": "Chargement des miniatures…",
  "photos.dropTitle": "Déposez pour envoyer",
  "photos.dropSub": "Un dossier devient un album du même nom",
  "photos.offline": "Disponible hors ligne, chiffrée dans l'application",
  "photos.downloaded": "Téléchargée dans le dossier Proton Photos",
  "photos.renameTitle": "Renommer la photo",
  "photos.namePlaceholder": "Nom du fichier",

  // Tile badges
  "badge.motionPhoto": "Photo animée",
  "badge.panorama": "Panorama",
  "badge.raw": "RAW",
  "badge.favorite": "Favori",

  // Search type filters
  "filter.images": "Images",
  "filter.videos": "Vidéos",

  // Filter panel
  "filter.title": "Filtrer",
  "filter.categories": "Catégories",
  "filter.type": "Type",
  "filter.mediaAll": "Tout",
  "filter.mediaPhotos": "Photos",
  "filter.reset": "Réinitialiser",

  // Categories
  "category.fav": "Favoris",
  "category.screen": "Captures d'écran",
  "category.video": "Vidéos",
  "category.live": "Live Photos",
  "category.selfie": "Selfies",
  "category.portrait": "Portraits",
  "category.burst": "Rafales",
  "category.pano": "Panoramas",
  "category.raw": "RAW",

  // Albums
  "albums.backToAlbums": "Retour aux albums",
  "albums.untitled": "Album sans titre",
  "albums.empty": "Cet album est vide",
  "albums.none": "Aucun album pour l'instant",
  "albums.noneSub": "Créez-en un ici, ou déposez un dossier sur la fenêtre.",
  "albums.keepDownloaded": "Télécharger cet album dans le dossier Proton Photos",
  "albums.keptDownloaded": "Téléchargement dans le dossier Proton Photos (cliquez pour arrêter)",
  "albums.freeUpTitle": "Libérer l'espace de cet album ?",
  "albums.freeUpCount.one":
    "L'album ne se télécharge plus tout seul. {count} photo est déjà dans le dossier Proton Photos et peut y rester, ou vous pouvez libérer l'espace qu'elle occupe. Elle reste dans Proton dans les deux cas.",
  "albums.freeUpCount.other":
    "L'album ne se télécharge plus tout seul. {count} photos sont déjà dans le dossier Proton Photos et peuvent y rester, ou vous pouvez libérer l'espace qu'elles occupent. Elles restent dans Proton dans les deux cas.",
  "albums.freeUpKeep": "Conserver les photos téléchargées",
  "albums.freeUpConfirm": "Libérer",
  "albums.newAlbum": "Nouvel album",
  "albums.newTitle": "Nommez l'album",
  "albums.namePlaceholder": "Nom de l'album",
  "albums.create": "Créer",
  "albums.createAndAdd": "Créer et ajouter",
  "albums.rename": "Renommer",
  "albums.renameTitle": "Renommer l'album",
  "albums.share": "Partager l'album",
  "albums.delete": "Supprimer l'album",
  "albums.deleted": "Album supprimé",
  "albums.addTitle": "Ajouter à un album",
  "albums.addCount.one": "Choisissez où placer {count} photo.",
  "albums.addCount.other": "Choisissez où placer {count} photos.",
  "albums.added": "{count} ajoutées",
  "albums.addPartial": "{ok} ajoutées, {failed} échouées",
  "albums.removed": "{count} retirées de l'album",
  "albums.removePartial": "{ok} retirées, {failed} échouées",
  "albums.coverSet": "Couverture mise à jour",
  "albums.strandedTitle.one": "{count} photo n'est que dans cet album",
  "albums.strandedTitle.other": "{count} photos ne sont que dans cet album",
  "albums.strandedMsg.one":
    "Elle n'est pas dans votre fil, donc supprimer l'album la supprime aussi. Enregistrez-la dans votre fil pour la conserver.",
  "albums.strandedMsg.other":
    "Elles ne sont pas dans votre fil, donc supprimer l'album les supprime aussi. Enregistrez-les dans votre fil pour les conserver.",
  "albums.savePhotos": "Enregistrer dans le fil",
  "albums.deletePhotosToo": "Supprimer aussi les photos",

  // Shared
  "shared.byMe": "Partagés par moi",
  "shared.withMe": "Partagés avec moi",
  "shared.flip": "Basculer entre partagés par moi et partagés avec moi",
  "shared.emptyByTitle": "Vous ne partagez rien",
  "shared.emptyWithTitle": "Rien de partagé avec vous",
  "shared.emptyBySub": "Les photos et albums que vous partagez apparaîtront ici.",
  "shared.emptyWithSub": "Les photos et albums que d'autres partagent avec vous apparaîtront ici.",
  "shared.publicLink": "Partagé via un lien public",
  "shared.album": "Album",
  "shared.manage": "Gérer le partage",
  "shared.back": "Retour aux partages",

  // Share dialog. A public link's URL carries the secret that decrypts what it
  // points at, so copying it whole is the whole point of the link section. A
  // link's password is never read back, so the dialog reports whether one is set
  // rather than showing it.
  "share.title": "Partager",
  "share.linkTitle": "Lien public",
  "share.linkDesc": "Toute personne disposant du lien peut ouvrir cette photo.",
  "share.createLink": "Créer un lien",
  "share.copyLink": "Copier le lien",
  "share.copied": "Copié",
  "share.removeLink": "Supprimer le lien",
  "share.passwordLabel": "Mot de passe",
  "share.passwordSet": "Requis pour ouvrir",
  "share.passwordNone": "Non défini",
  "share.passwordPlaceholder": "Nouveau mot de passe",
  "share.expiryLabel": "Expiration",
  "share.expiryNever": "Jamais",
  "share.expiryPast": "Choisissez une date future.",
  "share.add": "Ajouter",
  "share.change": "Modifier",
  "share.set": "Définir",
  "share.save": "Enregistrer",
  "share.albumInviteOnly": "Les albums se partagent par invitation, pas par un lien public.",
  "share.peopleTitle": "Personnes",
  "share.emailPlaceholder": "Adresse e-mail",
  "share.invite": "Inviter",
  "share.roleViewer": "Lecteur",
  "share.roleEditor": "Éditeur",
  "share.stateInvited": "Invité",
  "share.stateExternal": "Invité (sans compte Proton)",
  "share.remove": "Retirer",
  "share.noPeople": "Personne pour l'instant",
  "share.stopSharing": "Arrêter le partage",
  "share.notOwned":
    "Cet élément a été partagé avec vous. Seul son propriétaire peut modifier qui y a accès.",
  "share.badEmail": "Cela ne ressemble pas à une adresse e-mail.",
  "share.copyFailed": "Impossible de copier le lien",
  "share.failed": "Impossible de modifier le partage",
  "share.working": "En cours…",

  // Trash
  "trash.emptyTitle": "La corbeille est vide",
  "trash.emptySub":
    "Les photos que vous mettez à la corbeille apparaissent ici et peuvent être restaurées.",
  "trash.emptyAction": "Vider la corbeille",
  "trash.moved": "{count} mises à la corbeille",
  "trash.movedPartial": "{ok} mises à la corbeille, {failed} échouées",
  "trash.restored": "{count} restaurées",
  "trash.deleted": "{count} supprimées définitivement",
  "trash.emptied": "Corbeille vidée",
  "trash.partial": "{ok} effectuées, {failed} échouées",

  // Photo viewer / lightbox
  "viewer.details": "Détails",
  "viewer.offlineAdd": "Conserver une copie hors ligne, chiffrée dans l'application",
  "viewer.offlineRemove": "Supprimer la copie hors ligne",
  "viewer.download": "Télécharger dans le dossier Proton Photos",
  "viewer.saveToFolder": "Enregistrer une copie à l'endroit de votre choix",
  "viewer.freeUp": "Supprimer la copie locale pour libérer de l'espace",
  "viewer.detailsShortcut": "Détails (I)",
  "viewer.contents": "Contenu",
  "viewer.contentsShortcut": "Contenu (L)",
  "viewer.filmstrip": "Éléments voisins",
  "viewer.position": "{n} sur {total}",
  "viewer.favoriteShortcut": "Ajouter aux favoris (F)",
  "viewer.unfavoriteShortcut": "Retirer des favoris (F)",
  "viewer.trashShortcut": "Mettre à la corbeille (Del)",
  "viewer.shareShortcut": "Partager (S)",
  "viewer.rename": "Cliquez pour renommer",
  "viewer.closeShortcut": "Fermer (Esc)",
  "viewer.prev": "Précédent (←)",
  "viewer.next": "Suivant (→)",
  "viewer.name": "Nom",
  "viewer.type": "Type",
  "viewer.dimensions": "Dimensions",
  "viewer.taken": "Prise le",
  "viewer.added": "Ajoutée le",
  "viewer.modified": "Modifiée le",
  "viewer.size": "Taille",
  "viewer.onServer": "Espace utilisé",
  "viewer.albums": "Albums",
  "viewer.shared": "Partagée",
  "viewer.sharedPublic": "Lien public",
  "viewer.sharedPeople": "Avec des personnes",
  "viewer.sharedNo": "Non",
  "viewer.unverified": " (non vérifié)",
  "viewer.trashFailed": "Cette photo n'a pas pu être mise à la corbeille.",
  "viewer.favoriteFailed": "Les favoris n'ont pas pu être mis à jour.",
  "viewer.downloadFailed": "Cette photo n'a pas pu être téléchargée.",
  "viewer.zoomOut": "Dézoomer",
  "viewer.zoomIn": "Zoomer",
  "viewer.resetFit": "Ajuster à l'écran",
  "viewer.videoLoading": "Chargement de la vidéo…",
  "viewer.videoError":
    "Ce format vidéo ne peut pas être lu ici. Téléchargez-la pour la regarder dans un autre lecteur.",
  "viewer.videoTooLarge":
    "Cette vidéo est trop volumineuse pour être lue ici. Téléchargez-la pour la regarder dans un autre lecteur.",

  // The viewer's own video controls, which stand in for the browser's.
  "viewer.videoPlay": "Lire (Espace)",
  "viewer.videoPause": "Pause (Espace)",
  "viewer.videoStepBack": "Image précédente",
  "viewer.videoStepForward": "Image suivante",
  "viewer.videoSeek": "Position de lecture",
  "viewer.videoMute": "Couper le son",
  "viewer.videoUnmute": "Rétablir le son",

  // Local file viewer: a file opened from File Explorer, which the app can show
  // with nobody signed in. Everything both viewers say alike comes from above.
  "local.camera": "Appareil photo",
  "local.created": "Créée le",
  "local.path": "Emplacement",
  "local.upload": "Envoyer vers Proton",
  "local.uploadUnsupported": "Proton n'accepte pas ce type de fichier",
  "local.uploading": "Envoi en cours…",
  "local.uploaded": "Enregistrée sur Proton",
  "local.uploadSkipped": "Déjà enregistrée",
  "local.uploadFailed": "Échec de l'envoi. Réessayez.",
  "local.delete": "Supprimer",
  "local.deleteTitle": "Supprimer ce fichier ?",
  "local.deleteMessage": "« {name} » sera déplacé vers la corbeille.",
  "local.notFound": "Ce fichier a été déplacé ou supprimé.",
  "local.unreadable":
    "Ce fichier n'a pas pu être lu. Il est peut-être ouvert dans un autre programme, ou hors de portée de ce compte.",
  "local.openFailed": "Ce fichier n'a pas pu être ouvert.",
  "local.decodeFailed":
    "Cette photo n'a pas pu être lue. Le fichier est peut-être endommagé ou incomplet.",
  "local.videoUnsupported":
    "Ce format vidéo ne peut pas être lu ici. Ouvrez-la dans un autre lecteur.",
  "local.noCodec":
    "Windows n'a pas de décodeur pour ce format, il ne peut donc pas être affiché ici. Le Microsoft Store propose ce qui manque pour certains d'entre eux : les extensions HEIF et HEVC pour les photos HEIC, et Raw Image Extension pour les fichiers bruts d'appareil photo.",
  "local.signInTitle": "Connectez-vous pour envoyer",
  "local.signInBody":
    "La fenêtre de l'application s'ouvre pour vous connecter. Ce fichier reste ouvert ici.",
  "local.signInAction": "Se connecter",

  // Upload panel
  "upload.title": "Envoyer",
  "upload.filterName": "Photos et vidéos",
  "upload.dropHint": "Déposez des photos ou un dossier n'importe où sur la fenêtre",
  "upload.dropSub":
    "Les photos vont directement dans votre fil. Un dossier devient un album du même nom.",
  "upload.chooseFiles": "Choisir des fichiers",
  "upload.chooseFolder": "Choisir un dossier",
  "upload.alreadyThere": "{count} déjà présentes",
  "upload.failedCount": "{count} échouées",
  "upload.clear": "Effacer",
  "upload.statusUploading": "envoi…",
  "upload.statusSkipped": "ignorée",
  "upload.statusQueued": "en attente",
  "upload.statusFailed": "échouée",

  // Grid tile
  "grid.select": "Sélectionner",
  "grid.deselect": "Désélectionner",

  // Selection bar
  "selection.cancel": "Annuler la sélection (Esc)",
  "selection.count.one": "{count} photo sélectionnée",
  "selection.count.other": "{count} photos sélectionnées",
  "selection.trash": "Corbeille",
  "selection.restore": "Restaurer",
  "selection.deleteForever": "Supprimer définitivement",
  "selection.more": "Plus",
  "selection.download": "Télécharger",
  "selection.freeUp": "Libérer",
  "selection.addToAlbum": "Ajouter à un album",
  "selection.removeFromAlbum": "Retirer de l'album",
  "selection.setCover": "Définir comme couverture",
  "selection.rename": "Renommer",
  "selection.share": "Partager",
  "selection.favorite": "Ajouter aux favoris",
  "selection.unfavorite": "Retirer des favoris",
  "selection.offlineAdd": "Disponible hors ligne",
  "selection.offlineRemove": "Supprimer la copie hors ligne",
  // Download: the copy that lands in the Proton Photos folder, where Windows and any
  // other program can read it. Never called offline, which is the app's own copy.
  "download.freedUp": "{count} libérées",
  "download.freedUpNone": "Rien n'a été libéré",
  "download.notDownloaded": "Rien de téléchargé à libérer",
  "download.running": "Téléchargement…",
  "download.progress": "Téléchargement {done}/{total}…",
  "download.done": "{count} téléchargées dans le dossier Proton Photos",
  "download.donePartial": "{ok} sur {total} téléchargées",
  "download.doneNone":
    "Rien n'a été téléchargé. Le dossier Proton Photos n'est peut-être pas encore prêt.",
  "download.alreadyDownloaded": "Déjà téléchargées",
  "download.saved": "{count} enregistrées dans le dossier",
  "download.partial": "{ok} enregistrées, {failed} échouées",

  // Available offline: the app's own encrypted copy, which is not the Proton Photos
  // folder. These say where the copy went, so the two are never mistaken for one another.
  "offline.added.one":
    "{count} photo est en cours d'enregistrement pour une utilisation hors ligne",
  "offline.added.other":
    "{count} photos sont en cours d'enregistrement pour une utilisation hors ligne",
  "offline.removed.one": "{count} copie hors ligne supprimée",
  "offline.removed.other": "{count} copies hors ligne supprimées",
  "offline.alreadyOffline": "Déjà disponible hors ligne",
  "offline.noneOffline": "Aucune copie hors ligne à supprimer",
  "offline.failed": "impossible d'enregistrer pour une utilisation hors ligne",

  // Trash confirmation
  "confirm.trashTitle": "Mettre à la corbeille ?",
  "confirm.trashConfirm": "Mettre à la corbeille",
  "confirm.trashCount.one":
    "{count} photo sera mise à la corbeille. Vous pourrez la restaurer depuis l'onglet Corbeille.",
  "confirm.trashCount.other":
    "{count} photos seront mises à la corbeille. Vous pourrez les restaurer depuis l'onglet Corbeille.",
  "confirm.trashName":
    "« {name} » sera mis à la corbeille. Vous pourrez le restaurer depuis l'onglet Corbeille.",
  "confirm.thisPhoto": "Cette photo",

  // Remove from album. The photos stay in Photos; only the album loses them.
  "confirm.removeTitle": "Retirer de l'album ?",
  "confirm.removeConfirm": "Retirer",
  "confirm.removeCount.one":
    "{count} photo sera retirée de cet album et conservée dans votre fil.",
  "confirm.removeCount.other":
    "{count} photos seront retirées de cet album et conservées dans votre fil.",

  // Delete-forever confirmation. Nothing in the app or at Proton undoes these.
  "confirm.deleteTitle": "Supprimer définitivement ?",
  "confirm.deleteConfirm": "Supprimer définitivement",
  "confirm.deleteCount.one":
    "{count} photo sera définitivement supprimée de Proton. Cette action est irréversible.",
  "confirm.deleteCount.other":
    "{count} photos seront définitivement supprimées de Proton. Cette action est irréversible.",
  "confirm.emptyTitle": "Vider la corbeille ?",
  "confirm.emptyConfirm": "Tout supprimer",
  "confirm.emptyMessage":
    "Tout le contenu de la corbeille sera définitivement supprimé de Proton. Cette action est irréversible.",

  // Deleting an album skips the trash, so the album is gone for good even though
  // the photos in your timeline are not.
  "confirm.deleteAlbumTitle": "Supprimer cet album ?",
  "confirm.deleteAlbumMessage":
    "L'album sera supprimé et ne pourra pas être restauré. Les photos de votre fil sont conservées.",

  // Revoking sharing takes access away from people who may already hold the link,
  // and nothing is deleted by it, so both of these say exactly what is lost.
  "confirm.removeLinkTitle": "Supprimer le lien ?",
  "confirm.removeLinkMessage":
    "Le lien cesse de fonctionner pour toutes les personnes qui le possèdent. Les personnes invitées par e-mail conservent leur accès.",
  "confirm.removeLinkConfirm": "Supprimer le lien",
  "confirm.replaceLinkTitle": "Remplacer le lien ?",
  "confirm.replaceLinkMessage":
    "Ce lien est trop ancien pour être modifié : l'enregistrement le remplace par un nouveau lien à une autre adresse. L'ancien lien cesse de fonctionner pour toutes les personnes qui le possèdent et son mot de passe est supprimé. Le nouveau lien est copié dans votre presse-papiers.",
  "confirm.replaceLinkConfirm": "Remplacer le lien",
  "confirm.stopSharingTitle": "Arrêter le partage ?",
  "confirm.stopSharingMessage":
    "Le lien cesse de fonctionner et toutes les personnes invitées perdent leur accès. Rien n'est supprimé.",
  "confirm.stopSharingConfirm": "Arrêter le partage",

  // Freeing up drops the downloaded copies only. Nothing leaves Proton, so this asks
  // before a big change without treating it as one there is no way back from.
  "confirm.freeUpAllTitle": "Libérer toutes les photos téléchargées ?",
  "confirm.freeUpAllMessage":
    "Les {size} du dossier Proton Photos seront supprimés. Vos photos restent dans Proton et sont téléchargées à nouveau dès que vous les ouvrez.",
  "confirm.freeUpAllConfirm": "Libérer",

  // Removing every offline copy. The photos themselves are untouched, so this warns
  // about the download they will need next time and nothing more.
  "confirm.removeOfflineAllTitle": "Supprimer toutes les copies hors ligne ?",
  "confirm.removeOfflineAllMessage":
    "Les {size} conservés chiffrés dans l'application seront supprimés. Vos photos restent dans Proton et une connexion sera nécessaire pour les rouvrir.",
  "confirm.removeOfflineAllConfirm": "Supprimer",
};
