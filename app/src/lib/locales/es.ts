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

// Spanish (es) strings. Keys mirror en.ts exactly.
export const es: Record<string, string> = {
  // Common
  "common.cancel": "Cancelar",
  "common.close": "Cerrar",
  "common.back": "Atrás",
  "common.loading": "Cargando…",
  "common.photoCount.one": "{count} foto",
  "common.photoCount.other": "{count} fotos",

  // Navigation
  "nav.photos": "Fotos",
  "nav.albums": "Álbumes",
  "nav.shared": "Compartidos",

  // App shell
  "app.restoring": "Restaurando sesión…",
  "update.available": "La actualización {version} está disponible",
  "update.now": "Actualizar",
  "update.updating": "Actualizando…",
  "update.failed": "La actualización falló",
  "update.hashError": "La descarga no superó la verificación",
  "menu.reload": "Recargar",
  "menu.moreSoon": "Próximamente más…",
  "menu.quit": "Salir",

  // Tray popup
  "tray.open": "Abrir Photos for Proton",
  "tray.syncNow": "Sincronizar ahora",
  "tray.syncing": "Sincronizando…",
  "tray.synced": "Al día",

  // Login
  "login.subtitle": "Inicia sesión en tu cuenta de Proton",
  "login.emailLabel": "Correo o nombre de usuario",
  "login.passwordLabel": "Contraseña",
  "login.passwordPlaceholder": "Contraseña",
  "login.signIn": "Iniciar sesión",
  "login.signingIn": "Iniciando sesión…",
  "login.twofaLabel": "Código de dos factores",
  "login.verify": "Verificar",
  "login.verifying": "Verificando…",
  "login.captchaHint": "Proton te pide que confirmes que eres una persona.",
  "login.captchaExpired": "El captcha caducó. Resuélvelo de nuevo.",

  // Lock screen (returning cold start)
  "lock.subtitle": "Introduce tu contraseña para desbloquear",
  "lock.unlock": "Desbloquear",
  "lock.unlocking": "Desbloqueando…",
  "lock.wrongPassword": "Contraseña incorrecta",
  "lock.failed": "No se pudo desbloquear. Inténtalo de nuevo.",
  "lock.differentAccount": "Usar otra cuenta",

  // Titlebar
  "titlebar.minimize": "Minimizar",
  "titlebar.maximize": "Maximizar",

  // Settings
  "settings.title": "Ajustes",
  "settings.appearance": "Apariencia",
  "settings.theme": "Tema",
  "settings.themeDesc": "El tema Sistema sigue a Windows y se adapta a medida que cambia.",
  "settings.theme.dark": "Oscuro",
  "settings.theme.light": "Claro",
  "settings.theme.system": "Sistema",
  "settings.palette": "Paleta",
  "settings.paletteDesc": "Color de acento usado en toda la app.",
  "settings.palette.default": "Predeterminada",
  "settings.palette.forest": "Bosque",
  "settings.palette.sunset": "Atardecer",
  "settings.palette.sea": "Mar",
  "settings.palette.sepia": "Sepia",
  "settings.palette.mono": "Mono",
  "settings.palette.amoled": "Negro puro (AMOLED)",
  "settings.language": "Idioma",
  "settings.languageDesc": "Elige el idioma de la interfaz.",
  "settings.timeline": "Línea de tiempo",
  "settings.hideAlbum": "Ocultar fotos en álbumes de Drive",
  "settings.hideAlbumDesc":
    "Las fotos añadidas a un álbum de Drive no aparecerán en tu línea de tiempo principal. Siguen visibles en las pestañas Álbumes y Compartidos, y en los filtros de categorías.",
  "settings.security": "Seguridad",
  "settings.lockOnHide": "Pedir contraseña al reabrir desde la bandeja",
  "settings.debug": "Superposición de depuración",
  "settings.debugDesc": "Muestra un HUD de memoria en tiempo real (tamaños de heap y caché).",
  "settings.explorer": "Explorador de archivos",
  "settings.showInExplorer": 'Mostrar "Proton Photos" en el Explorador de archivos',
  "settings.showInExplorerDesc":
    "Añade una entrada Proton Photos a la barra lateral del Explorador con tus fotos de la nube. Surte efecto tras reiniciar.",
  "settings.autoDownload": "Descargar automáticamente las fotos nuevas",
  "settings.autoDownloadDesc":
    "A medida que se añaden fotos nuevas a tu biblioteca, guarda una copia en este dispositivo automáticamente.",
  "settings.restartNeeded": "Reinicia para aplicar este cambio.",
  "settings.restartNow": "Reiniciar ahora",
  "settings.lockOnHideDesc":
    "Cuando la ventana se cierra a la bandeja, la app se bloquea y pide tu contraseña la próxima vez que la abras.",

  // Profile menu
  "profile.storage": "Almacenamiento",
  "profile.used": "{size} usados",
  "profile.total": "{size} en total",
  "profile.signOut": "Cerrar sesión",

  // Avatar
  "avatar.uploading": "Subiendo",
  "avatar.syncing": "Sincronizando",
  "avatar.account": "Cuenta y ajustes",
  "avatar.showUploads": "Mostrar subidas",

  // Photos view
  "photos.all": "Todas",
  "photos.search": "Buscar",
  "photos.searchPlaceholder": "Busca por nombre de archivo o tipo…",
  "photos.closeSearch": "Cerrar búsqueda",
  "photos.smaller": "Más pequeñas",
  "photos.bigger": "Más grandes",
  "photos.indexing": "Indexando {done}/{total}",
  "photos.uploadTitle": "Sube fotos, o una carpeta como álbum",
  "photos.uploadingProgress": "Subiendo {progress}",
  "photos.noMatches": "Sin coincidencias",
  "photos.noPhotos": "Aún no hay fotos",
  "photos.noPhotosSub": "Tus fotos aparecerán aquí tras la sincronización.",
  "photos.stillIndexing": "Aún indexando, aparecerán más resultados.",
  "photos.loadingThumbnails": "Cargando miniaturas…",
  "photos.dropTitle": "Suelta para subir",
  "photos.dropSub": "Una carpeta se convierte en un álbum con el mismo nombre",
  "photos.offline": "Disponible sin conexión",

  // Search type filters
  "filter.images": "Imágenes",
  "filter.videos": "Vídeos",

  // Filter panel
  "filter.title": "Filtrar",
  "filter.categories": "Categorías",
  "filter.type": "Tipo",
  "filter.mediaAll": "Todo",
  "filter.mediaPhotos": "Fotos",
  "filter.reset": "Restablecer",

  // Categories
  "category.fav": "Favoritos",
  "category.screen": "Capturas de pantalla",
  "category.video": "Vídeos",
  "category.live": "Live Photos",
  "category.selfie": "Selfies",
  "category.portrait": "Retratos",
  "category.burst": "Ráfagas",
  "category.pano": "Panorámicas",
  "category.raw": "RAW",

  // Albums
  "albums.backToAlbums": "Volver a álbumes",
  "albums.untitled": "Álbum sin título",
  "albums.empty": "Este álbum está vacío",
  "albums.none": "Aún no hay álbumes",
  "albums.noneSub": "Suelta una carpeta en la ventana para crear uno.",
  "albums.keepOffline": "Mantener este álbum en este dispositivo",
  "albums.keptOffline": "Guardado en este dispositivo (clic para detener)",

  // Shared
  "shared.byMe": "Compartido por mí",
  "shared.withMe": "Compartido conmigo",
  "shared.emptyByTitle": "No estás compartiendo nada",
  "shared.emptyWithTitle": "Nada compartido contigo",
  "shared.emptyBySub": "Las fotos y álbumes que compartas aparecerán aquí.",
  "shared.emptyWithSub": "Las fotos y álbumes que otros compartan contigo aparecerán aquí.",
  "shared.publicLink": "Compartido mediante enlace público",
  "shared.album": "Álbum",

  // Photo viewer / lightbox
  "viewer.details": "Detalles",
  "viewer.download": "Guardar sin conexión",
  "viewer.freeUp": "Liberar espacio",
  "viewer.detailsShortcut": "Detalles (I)",
  "viewer.trashShortcut": "Mover a la papelera (Del)",
  "viewer.rename": "Haz clic para renombrar",
  "viewer.closeShortcut": "Cerrar (Esc)",
  "viewer.prev": "Anterior (←)",
  "viewer.next": "Siguiente (→)",
  "viewer.name": "Nombre",
  "viewer.type": "Tipo",
  "viewer.dimensions": "Dimensiones",
  "viewer.taken": "Capturada",
  "viewer.added": "Añadida",
  "viewer.modified": "Modificada",
  "viewer.size": "Tamaño",
  "viewer.onServer": "En el servidor",
  "viewer.albums": "Álbumes",
  "viewer.shared": "Compartida",
  "viewer.sharedPublic": "Enlace público",
  "viewer.sharedPeople": "Con personas",
  "viewer.sharedNo": "No",
  "viewer.unverified": " (sin verificar)",
  "viewer.trashFailed": "no se pudo mover a la papelera",
  "viewer.zoomOut": "Alejar",
  "viewer.zoomIn": "Acercar",
  "viewer.resetFit": "Ajustar a la pantalla",
  "viewer.videoLoading": "Cargando vídeo…",
  "viewer.videoError": "Este formato de vídeo no se puede reproducir aquí. Descárgalo para verlo.",
  "viewer.videoTooLarge": "Este vídeo es demasiado grande para reproducirlo aquí. Descárgalo para verlo.",

  // Upload panel
  "upload.title": "Subir",
  "upload.filterName": "Fotos y vídeos",
  "upload.dropHint": "Suelta fotos o una carpeta en cualquier parte de la ventana",
  "upload.dropSub":
    "Las fotos van directas a tu línea de tiempo. Una carpeta se convierte en un álbum con el mismo nombre.",
  "upload.chooseFiles": "Elegir archivos",
  "upload.chooseFolder": "Elegir carpeta",
  "upload.alreadyThere": "{count} ya presentes",
  "upload.failedCount": "{count} fallidas",
  "upload.clear": "Limpiar",
  "upload.statusUploading": "subiendo…",
  "upload.statusSkipped": "omitida",
  "upload.statusQueued": "en cola",
  "upload.statusFailed": "fallida",

  // Grid tile
  "grid.select": "Seleccionar",
  "grid.deselect": "Deseleccionar",

  // Selection bar
  "selection.cancel": "Cancelar selección (Esc)",
  "selection.count.one": "{count} foto seleccionada",
  "selection.count.other": "{count} fotos seleccionadas",
  "selection.trash": "Papelera",
  "selection.download": "Descargar",
  "selection.freeUp": "Liberar",
  "download.freedUp": "{count} liberadas",
  "download.notDownloaded": "No hay nada descargado que liberar",
  "download.running": "Descargando…",
  "download.done": "{count} guardadas sin conexión",
  "download.alreadyOffline": "Ya disponibles sin conexión",
  "download.partial": "Guardadas {ok}, {failed} fallidas",

  // Trash confirmation
  "confirm.trashTitle": "¿Mover a la papelera?",
  "confirm.trashConfirm": "Mover a la papelera",
  "confirm.trashCount.one":
    "{count} foto se moverá a la papelera. Puedes restaurarla desde Proton Drive.",
  "confirm.trashCount.other":
    "{count} fotos se moverán a la papelera. Puedes restaurarlas desde Proton Drive.",
  "confirm.trashName":
    '"{name}" se moverá a la papelera. Puedes restaurarla desde Proton Drive.',
  "confirm.thisPhoto": "Esta foto",
};
