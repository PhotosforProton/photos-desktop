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
    "À mesure que de nouvelles photos sont ajoutées à votre bibliothèque, une copie est conservée automatiquement sur cet appareil.",
  "settings.restartNeeded": "Redémarrez pour appliquer ce changement.",
  "settings.restartNow": "Redémarrer maintenant",
  "settings.lockOnHideDesc":
    "Lorsque la fenêtre est réduite dans la zone de notification, l'application se verrouille et demande votre mot de passe à la prochaine ouverture.",

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
  "photos.smaller": "Plus petit",
  "photos.bigger": "Plus grand",
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
  "photos.offline": "Disponible hors ligne",

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
  "albums.noneSub": "Déposez un dossier sur la fenêtre pour en créer un.",
  "albums.keepOffline": "Conserver cet album sur cet appareil",
  "albums.keptOffline": "Conservé sur cet appareil (cliquez pour arrêter)",

  // Shared
  "shared.byMe": "Partagés par moi",
  "shared.withMe": "Partagés avec moi",
  "shared.emptyByTitle": "Vous ne partagez rien",
  "shared.emptyWithTitle": "Rien de partagé avec vous",
  "shared.emptyBySub": "Les photos et albums que vous partagez apparaîtront ici.",
  "shared.emptyWithSub": "Les photos et albums que d'autres partagent avec vous apparaîtront ici.",
  "shared.publicLink": "Partagé via un lien public",
  "shared.album": "Album",

  // Photo viewer / lightbox
  "viewer.details": "Détails",
  "viewer.download": "Conserver hors ligne",
  "viewer.freeUp": "Libérer de l'espace",
  "viewer.detailsShortcut": "Détails (I)",
  "viewer.trashShortcut": "Mettre à la corbeille (Del)",
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
  "viewer.onServer": "Sur le serveur",
  "viewer.albums": "Albums",
  "viewer.shared": "Partagée",
  "viewer.sharedPublic": "Lien public",
  "viewer.sharedPeople": "Avec des personnes",
  "viewer.sharedNo": "Non",
  "viewer.unverified": " (non vérifié)",
  "viewer.trashFailed": "impossible de mettre à la corbeille",
  "viewer.zoomOut": "Dézoomer",
  "viewer.zoomIn": "Zoomer",
  "viewer.resetFit": "Ajuster à l'écran",
  "viewer.videoLoading": "Chargement de la vidéo…",
  "viewer.videoError": "Ce format vidéo ne peut pas être lu ici. Téléchargez-la pour la regarder.",
  "viewer.videoTooLarge": "Cette vidéo est trop volumineuse pour être lue ici. Téléchargez-la pour la regarder.",

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
  "selection.download": "Télécharger",
  "selection.freeUp": "Libérer",
  "download.freedUp": "{count} libérées",
  "download.notDownloaded": "Rien de téléchargé à libérer",
  "download.running": "Téléchargement…",
  "download.done": "{count} conservées hors ligne",
  "download.alreadyOffline": "Déjà disponible hors ligne",
  "download.partial": "{ok} enregistrées, {failed} échouées",

  // Trash confirmation
  "confirm.trashTitle": "Mettre à la corbeille ?",
  "confirm.trashConfirm": "Mettre à la corbeille",
  "confirm.trashCount.one":
    "{count} photo sera mise à la corbeille. Vous pourrez la restaurer depuis Proton Drive.",
  "confirm.trashCount.other":
    "{count} photos seront mises à la corbeille. Vous pourrez les restaurer depuis Proton Drive.",
  "confirm.trashName":
    "« {name} » sera mis à la corbeille. Vous pourrez le restaurer depuis Proton Drive.",
  "confirm.thisPhoto": "Cette photo",
};
