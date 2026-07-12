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

// The "Proton Photos" folder: the app's own place in Windows Explorer, and the
// default destination for downloaded originals. It appears in the Explorer
// navigation pane like a cloud drive once registered as a Cloud Filter sync root
// (see register.rs / the sync-root layer). Registration is best-effort: if it is
// not available the folder is still a normal, usable folder and downloads still
// work, so this layer never blocks the app.

use std::path::PathBuf;

const FOLDER_NAME: &str = "Proton Photos";

/// `%USERPROFILE%\Proton Photos` — a stable, top-level per-user location, the same
/// pattern OneDrive uses for its own folder.
pub fn sync_root_path() -> PathBuf {
    PathBuf::from(std::env::var("USERPROFILE").unwrap_or_default()).join(FOLDER_NAME)
}

/// Create the folder if it is missing. Cheap and idempotent; safe on every launch.
pub fn ensure_folder() {
    let _ = std::fs::create_dir_all(sync_root_path());
}

#[cfg(windows)]
const PREF_KEY: &str = "Software\\PhotosForProton";
#[cfg(windows)]
const PREF_VALUE: &str = "ShowInExplorer";

/// Whether the Explorer "Proton Photos" mount is enabled. Default ON when the value
/// is missing. Set by the installer checkbox and the Settings toggle; read once at
/// startup to decide whether to mount.
#[cfg(windows)]
pub fn show_in_explorer_enabled() -> bool {
    winreg::RegKey::predef(winreg::enums::HKEY_CURRENT_USER)
        .open_subkey(PREF_KEY)
        .and_then(|k| k.get_value::<u32, _>(PREF_VALUE))
        .map(|v| v != 0)
        .unwrap_or(true)
}
#[cfg(not(windows))]
pub fn show_in_explorer_enabled() -> bool {
    false
}

/// The current preference, for the Settings toggle.
#[tauri::command]
pub fn show_in_explorer() -> bool {
    show_in_explorer_enabled()
}

/// Set the preference. Applies on the next app start (registering/unregistering the
/// sync root live is deliberately avoided — cleaner and less error-prone).
#[tauri::command]
pub fn set_show_in_explorer(enabled: bool) {
    #[cfg(windows)]
    if let Ok((key, _)) =
        winreg::RegKey::predef(winreg::enums::HKEY_CURRENT_USER).create_subkey(PREF_KEY)
    {
        let _ = key.set_value(PREF_VALUE, &u32::from(enabled));
    }
    #[cfg(not(windows))]
    let _ = enabled;
}

#[cfg(windows)]
const AUTO_DL_VALUE: &str = "AutoDownload";

/// Whether photos newly added to the library are automatically kept on this
/// device. Default OFF. Read during populate to hydrate the fresh arrivals.
#[cfg(windows)]
pub fn auto_download_enabled() -> bool {
    winreg::RegKey::predef(winreg::enums::HKEY_CURRENT_USER)
        .open_subkey(PREF_KEY)
        .and_then(|k| k.get_value::<u32, _>(AUTO_DL_VALUE))
        .map(|v| v != 0)
        .unwrap_or(false)
}

/// The current preference, for the Settings toggle.
#[tauri::command]
pub fn auto_download() -> bool {
    #[cfg(windows)]
    {
        auto_download_enabled()
    }
    #[cfg(not(windows))]
    false
}

/// Set the preference. Takes effect on the next populate pass (as new photos sync).
#[tauri::command]
pub fn set_auto_download(enabled: bool) {
    #[cfg(windows)]
    if let Ok((key, _)) =
        winreg::RegKey::predef(winreg::enums::HKEY_CURRENT_USER).create_subkey(PREF_KEY)
    {
        let _ = key.set_value(AUTO_DL_VALUE, &u32::from(enabled));
    }
    #[cfg(not(windows))]
    let _ = enabled;
}

/// The default download destination, handed to the sidecar as `destDir`.
#[tauri::command]
pub fn downloads_dir() -> String {
    let path = sync_root_path();
    let _ = std::fs::create_dir_all(&path);
    path.to_string_lossy().into_owned()
}

/// Open the folder in Explorer — called after a download so the user immediately
/// sees where the files landed.
#[tauri::command]
pub fn reveal_downloads() {
    let path = sync_root_path();
    let _ = std::fs::create_dir_all(&path);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        let _ = std::process::Command::new("explorer.exe")
            .arg(&path)
            .creation_flags(CREATE_NO_WINDOW)
            .spawn();
    }
}

/// Register the folder as a Cloud Filter sync root (so it shows in the Explorer
/// nav pane as "Proton Photos" with the app icon, like OneDrive) and connect the
/// sync engine (so cloud-photo placeholders hydrate on open). Runs on one
/// COM-initialized thread: registration MUST come before connect (you can only
/// connect to a registered root). Best-effort and non-blocking — any failure just
/// leaves an ordinary folder where downloads still work. Registration lives in
/// HKCU and persists across reboots, so registering once is enough.
#[cfg(windows)]
pub fn mount(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        use cloud_filter::root::Session;
        use windows::Win32::System::Com::{CoInitializeEx, COINIT_APARTMENTTHREADED};
        // The Storage Provider (register) APIs need an initialized COM apartment.
        unsafe {
            let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
        }
        // Sweep any hydration temp files a previous run left behind (a crash between
        // the sidecar writing one and the host deleting it). None can be in use yet,
        // since no hydration has run this process.
        reap_hydrate_temps();
        let log = app.clone();
        match try_register_sync_root() {
            Ok(()) => crate::note(&log, "[cloud] sync root registered"),
            Err(e) => crate::note(&log, &format!("[cloud] register skipped: {e}")),
        }
        let folder = sync_root_path();
        match Session::new().connect(&folder, ProtonSyncFilter { app }) {
            // Leak the connection so it stays connected for the process lifetime
            // (dropping it would disconnect the sync engine).
            Ok(connection) => {
                crate::note(&log, "[cloud] sync engine connected");
                std::mem::forget(connection);
            }
            Err(e) => crate::note(&log, &format!("[cloud] connect failed: {e:?}")),
        }
    });
}

/// Remove leftover `pfp-hyd-*.bin` hydration temp files from the system temp dir.
/// Each is a decrypted download the sidecar staged for a placeholder transfer; the
/// host deletes it right after the transfer, so any still present at startup are
/// orphans from an earlier crash. None can be in use yet this run.
#[cfg(windows)]
fn reap_hydrate_temps() {
    let Ok(entries) = std::fs::read_dir(std::env::temp_dir()) else {
        return;
    };
    for entry in entries.flatten() {
        let name = entry.file_name();
        let name = name.to_string_lossy();
        if name.starts_with("pfp-hyd-") && name.ends_with(".bin") {
            let _ = std::fs::remove_file(entry.path());
        }
    }
}

#[cfg(windows)]
fn try_register_sync_root() -> Result<(), String> {
    use cloud_filter::root::{is_supported, SecurityId, SyncRootIdBuilder};

    let folder = sync_root_path();
    std::fs::create_dir_all(&folder).map_err(|e| e.to_string())?;

    if !is_supported().map_err(|e| format!("{e:?}"))? {
        return Err("Cloud Files API unavailable on this Windows build".into());
    }

    let id = SyncRootIdBuilder::new("ProtonPhotos") // stable provider id, no '!'
        .user_security_id(SecurityId::current_user().map_err(|e| format!("{e:?}"))?)
        .build();

    // Re-register ONCE when the registration policy changes (bump POLICY_VERSION), so
    // a registration made by an older build with an incorrect policy is refreshed.
    // Otherwise skip — the registration persists in HKCU across reboots.
    const POLICY_VERSION: u32 = 3;
    let registered = id.is_registered().map_err(|e| format!("{e:?}"))?;
    if registered && policy_version() == POLICY_VERSION {
        return Ok(());
    }
    if registered {
        let _ = id.unregister(); // stale policy -> refresh with the current one
    }

    // Point the nav-pane icon at the app executable's embedded icon (index 0).
    let exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe = exe.to_string_lossy();
    let icon = exe.strip_prefix(r"\\?\").unwrap_or(&exe);

    register_with_insync_policy(&id, &folder, &format!("{icon},0")).map_err(|e| format!("{e:?}"))?;
    set_policy_version(POLICY_VERSION);
    Ok(())
}

/// Register the sync root directly through cloud-filter's own `windows` (0.58) so we
/// can set `InSyncPolicy = PreserveInsyncForSyncEngine` — the one policy that keeps a
/// download-only provider's files in-sync through hydration, which is what lets
/// Explorer "Free up space" work (a not-in-sync placeholder is never dehydrated, so
/// the NOTIFY_DEHYDRATE callback is not even reached). The crate's typed builder
/// cannot express this flag. Everything else matches what the crate would set.
#[cfg(windows)]
fn register_with_insync_policy(
    id: &cloud_filter::root::SyncRootId,
    folder: &std::path::Path,
    icon: &str,
) -> windows058::core::Result<()> {
    use windows058::core::HSTRING;
    use windows058::Security::Cryptography::{BinaryStringEncoding, CryptographicBuffer};
    use windows058::Storage::Provider::{
        StorageProviderHydrationPolicy, StorageProviderInSyncPolicy, StorageProviderPopulationPolicy,
        StorageProviderProtectionMode, StorageProviderSyncRootInfo, StorageProviderSyncRootManager,
    };
    use windows058::Storage::StorageFolder;

    let path_h = HSTRING::from(folder.to_string_lossy().as_ref());
    let storage_folder = StorageFolder::GetFolderFromPathAsync(&path_h)?.get()?;

    let info = StorageProviderSyncRootInfo::new()?;
    info.SetId(id.as_hstring())?;
    info.SetPath(&storage_folder)?;
    info.SetDisplayNameResource(&HSTRING::from("Proton Photos"))?;
    info.SetIconResource(&HSTRING::from(icon))?;
    info.SetHydrationPolicy(StorageProviderHydrationPolicy::Full)?;
    info.SetPopulationPolicy(StorageProviderPopulationPolicy::AlwaysFull)?;
    info.SetInSyncPolicy(StorageProviderInSyncPolicy::PreserveInsyncForSyncEngine)?;
    // Manage hydration ONLY from the app: disallowing pinning makes Explorer hide its
    // "Always keep on this device" / "Free up space" menu, so the user cannot get a
    // file stuck via the shell's (broken-for-us) free-up path. The app's Download /
    // Free up buttons drive hydration directly (CfHydratePlaceholder / CfDehydratePlaceholder).
    info.SetAllowPinning(false)?;
    info.SetShowSiblingsAsGroup(false)?;
    info.SetProtectionMode(StorageProviderProtectionMode::Unknown)?;
    info.SetVersion(&HSTRING::from("1.0.0"))?;
    let ctx = CryptographicBuffer::ConvertStringToBinary(id.as_hstring(), BinaryStringEncoding::Utf8)?;
    info.SetContext(&ctx)?;
    StorageProviderSyncRootManager::Register(&info)?;
    Ok(())
}

/// The registration-policy version last written, so we re-register only when it changes.
#[cfg(windows)]
fn policy_version() -> u32 {
    winreg::RegKey::predef(winreg::enums::HKEY_CURRENT_USER)
        .open_subkey(PREF_KEY)
        .and_then(|k| k.get_value::<u32, _>("RegPolicyVersion"))
        .unwrap_or(0)
}
#[cfg(windows)]
fn set_policy_version(v: u32) {
    if let Ok((key, _)) =
        winreg::RegKey::predef(winreg::enums::HKEY_CURRENT_USER).create_subkey(PREF_KEY)
    {
        let _ = key.set_value("RegPolicyVersion", &v);
    }
}

/// Remove the Explorer "Proton Photos" sync-root registration (nav-pane entry).
/// Called at startup when the preference is off, so opting out actually takes it
/// out of Explorer instead of only skipping the mount (the registration persists
/// in HKCU, so it would otherwise linger).
#[cfg(windows)]
pub fn unmount(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        use cloud_filter::root::{SecurityId, SyncRootIdBuilder};
        use windows::Win32::System::Com::{CoInitializeEx, COINIT_APARTMENTTHREADED};
        unsafe {
            let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
        }
        let Ok(sid) = SecurityId::current_user() else {
            return;
        };
        let id = SyncRootIdBuilder::new("ProtonPhotos").user_security_id(sid).build();
        if id.is_registered().unwrap_or(false) {
            match id.unregister() {
                Ok(()) => crate::note(&app, "[cloud] unmounted (opt-out)"),
                Err(e) => crate::note(&app, &format!("[cloud] unmount failed: {e:?}")),
            }
        }
    });
}

#[cfg(not(windows))]
pub fn mount(_app: tauri::AppHandle) {}
#[cfg(not(windows))]
pub fn unmount(_app: tauri::AppHandle) {}

/// Mark freshly downloaded files as "in sync" so Explorer shows them as available
/// (a green check) rather than "waiting for sync". In a sync root a plain new file
/// reads as a pending upload; converting it to an in-sync placeholder — data kept,
/// NOT dehydrated — fixes the status without touching the bytes. Best-effort per
/// file (these are Win32 Cloud Filter calls, no COM apartment needed).
#[tauri::command]
pub fn mark_in_sync(dir: String, names: Vec<String>) {
    #[cfg(windows)]
    {
        let base = std::path::PathBuf::from(&dir);
        for name in &names {
            if let Err(e) = mark_one_in_sync(&base.join(name)) {
                eprintln!("[cloud_mount] mark_in_sync skipped: {e}");
            }
        }
    }
    #[cfg(not(windows))]
    let _ = (dir, names);
}

#[cfg(windows)]
fn mark_one_in_sync(path: &std::path::Path) -> Result<(), String> {
    use cloud_filter::placeholder::{ConvertOptions, OpenOptions};
    let mut placeholder = OpenOptions::new()
        .write_access()
        .open(path)
        .map_err(|e| format!("{e:?}"))?;
    placeholder
        .convert_to_placeholder(ConvertOptions::default().mark_in_sync(), None)
        .map_err(|e| format!("{e:?}"))?;
    Ok(())
}

// ---- Cloud photos as files-on-demand placeholders (the "green cloud") ----

/// Windows FILETIME (100ns ticks since 1601) from unix milliseconds.
#[cfg(windows)]
fn unix_ms_to_filetime(ms: i64) -> i64 {
    if ms <= 0 {
        return 0;
    }
    (ms + 11_644_473_600_000) * 10_000
}

/// Make a photo name safe as a file name (strip path separators / illegal chars).
#[cfg(windows)]
fn sanitize_name(name: &str) -> String {
    let cleaned: String = name
        .chars()
        .map(|c| {
            if "\\/:*?\"<>|".contains(c) || (c as u32) < 32 {
                '_'
            } else {
                c
            }
        })
        .collect();
    let trimmed = cleaned.trim().trim_matches('.').trim().to_string();
    if trimmed.is_empty() {
        "photo".to_string()
    } else {
        trimmed
    }
}

/// uid -> the placeholder paths (relative to the sync root) that stand for it,
/// filled during populate. A photo has one entry under `Photos\` and one more per
/// album it belongs to, so the app's Download / Free up can act on every copy.
#[cfg(windows)]
static MOUNT_INDEX: std::sync::OnceLock<
    std::sync::Mutex<std::collections::HashMap<String, Vec<String>>>,
> = std::sync::OnceLock::new();

#[cfg(windows)]
fn mount_index() -> &'static std::sync::Mutex<std::collections::HashMap<String, Vec<String>>> {
    MOUNT_INDEX.get_or_init(|| std::sync::Mutex::new(std::collections::HashMap::new()))
}

/// Record one placeholder path (relative to the sync root) for a photo. The first
/// path recorded is its primary (`Photos\`) copy — the one Download hydrates.
#[cfg(windows)]
fn index_push(uid: &str, rel: &str) {
    mount_index()
        .lock()
        .unwrap()
        .entry(uid.to_string())
        .or_default()
        .push(rel.to_string());
}

/// Keep one file on the device as a proper in-sync placeholder, whatever state it is
/// in. A cloud placeholder is hydrated in place (its data downloaded) and re-marked
/// in-sync; a plain file that has lost its placeholder status (e.g. after a provider
/// disconnect across app restarts, which strands it "waiting to sync" and un-freeable)
/// is converted to an in-sync placeholder with its data preserved and its uid blob
/// restored, so Explorer shows the green check and a later Free up still works.
/// Returns whether it ended up local.
#[cfg(windows)]
fn keep_offline_one(
    app: &tauri::AppHandle,
    base: &std::path::Path,
    rel: &str,
    uid: Option<&str>,
) -> bool {
    use cloud_filter::placeholder::OpenOptions;
    let path = base.join(rel);
    // If it is a cloud placeholder, hydrate it in place. `info()` is None for a plain
    // (non-placeholder) file. The oplock handle is dropped at the end of this match,
    // before any conversion, because CfConvertToPlaceholder needs a plain Win32 handle.
    match OpenOptions::new().write_access().open(&path) {
        Ok(mut ph) => {
            if ph.info().ok().flatten().is_some() {
                if ph.hydrate(..).is_ok() {
                    let _ = ph.mark_in_sync(true, None);
                    return true;
                }
                return false;
            }
        }
        Err(_) => return false,
    }
    // A regular file that lost its placeholder status: convert it back (data kept, no
    // dehydrate), re-attaching the uid so a future free-up / re-hydrate can find it.
    match convert_file_to_placeholder(&path, uid.unwrap_or(""), false) {
        Ok(()) => true,
        Err(e) => {
            // No file name / uid in the log — just the outcome and the OS error.
            crate::note(app, &format!("[keep] convert failed: {e}"));
            false
        }
    }
}

/// Bring a file left on disk by a previous install back into the sync engine.
///
/// `PlaceholderFile::create` fails on a name collision, so after a reinstall the
/// kept-offline photos already sitting in `Photos\` / `Albums\` are skipped and
/// left as plain files — Explorer shows them "waiting to sync" and the app never
/// badges them as offline. Converting the on-disk file to an in-sync placeholder
/// (data preserved, NOT dehydrated) carrying its uid blob fixes both: the green
/// check returns and a later free-up / re-hydrate can still find the photo. If the
/// file is already a placeholder, convert fails and re-asserting in-sync is enough.
#[cfg(windows)]
fn reconcile_existing(app: &tauri::AppHandle, path: &std::path::Path, uid: &str) -> bool {
    use cloud_filter::placeholder::OpenOptions;
    // Probe with the crate's oplock handle: an existing placeholder (dehydrated or
    // hydrated) just needs to read in-sync so it is not stranded on "waiting to sync".
    // The handle is dropped before any conversion — CfConvertToPlaceholder needs a
    // plain Win32 handle instead of the oplock one.
    match OpenOptions::new().write_access().open(path) {
        Ok(mut ph) => {
            if ph.info().ok().flatten().is_some() {
                return ph.mark_in_sync(true, None).is_ok();
            }
        }
        Err(_) => return false,
    }
    // A plain file that lost its placeholder status: convert it back (data kept), with
    // its uid blob restored.
    match convert_file_to_placeholder(path, uid, false) {
        Ok(()) => true,
        Err(e) => {
            // No file name / uid in the log — just the outcome and the OS error.
            crate::note(app, &format!("[reconcile] convert failed: {e}"));
            false
        }
    }
}

/// Where the auto-download "seen" snapshot lives (the library uid list from the
/// previous populate). Kept next to sidecar.log in the app data dir.
#[cfg(windows)]
fn seen_path(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    crate::secure_store::app_dir(app).ok().map(|d| d.join("mount_seen.txt"))
}

/// The uids present at the last populate, or None if there is no snapshot yet
/// (a first run, which only seeds the snapshot and downloads nothing).
#[cfg(windows)]
fn load_seen(app: &tauri::AppHandle) -> Option<std::collections::HashSet<String>> {
    let text = std::fs::read_to_string(seen_path(app)?).ok()?;
    Some(text.lines().map(str::trim).filter(|l| !l.is_empty()).map(String::from).collect())
}

#[cfg(windows)]
fn save_seen(app: &tauri::AppHandle, uids: &[String]) {
    if let Some(path) = seen_path(app) {
        let _ = std::fs::write(path, uids.join("\n"));
    }
}

/// Older builds created placeholders directly at the sync-root top level; this
/// build groups them under `Photos\` and `Albums\`. Remove the stale loose
/// placeholders so the folder is not left with a duplicate beside the new layout.
/// Only dehydrated (cloud-only) top-level files are touched — never a subfolder
/// and never a file the user kept offline.
#[cfg(windows)]
fn cleanup_stale_root(folder: &std::path::Path) {
    use std::os::windows::fs::MetadataExt;
    const RECALL_ON_DATA_ACCESS: u32 = 0x0040_0000;
    let Ok(entries) = std::fs::read_dir(folder) else {
        return;
    };
    for entry in entries.flatten() {
        if entry.file_type().map(|t| t.is_file()).unwrap_or(false) {
            if let Ok(meta) = entry.metadata() {
                if meta.file_attributes() & RECALL_ON_DATA_ACCESS != 0 {
                    let _ = std::fs::remove_file(entry.path());
                }
            }
        }
    }
}

/// Whether the mount is mid-sync right now, mirrored from `set_busy` so the tray
/// popup (a separate window that may open at any moment) can show the current state
/// without waiting for the next `mount-busy` transition.
#[cfg(windows)]
static SYNC_BUSY: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

/// Tell the UI the mount is doing heavy sidecar work (populate / hydration), so the
/// background thumbnail warmer pauses and lets that work own the single sidecar RPC
/// channel. Paired true/false around each heavy operation.
#[cfg(windows)]
fn set_busy(app: &tauri::AppHandle, busy: bool) {
    use tauri::Emitter;
    SYNC_BUSY.store(busy, std::sync::atomic::Ordering::Relaxed);
    let _ = app.emit("mount-busy", busy);
}

/// The current sync state, for the tray popup's status line (live updates arrive via
/// the "mount-busy" event; this is the value to show when the popup first opens).
#[tauri::command]
pub fn sync_busy() -> bool {
    #[cfg(windows)]
    {
        SYNC_BUSY.load(std::sync::atomic::Ordering::Relaxed)
    }
    #[cfg(not(windows))]
    false
}

/// Whether one placeholder (relative path from the sync root) is hydrated (has its
/// data on the device). Dehydrated cloud-only placeholders carry RECALL_ON_DATA_ACCESS.
#[cfg(windows)]
fn is_hydrated(base: &std::path::Path, rel: &str) -> bool {
    use std::os::windows::fs::MetadataExt;
    const RECALL_ON_DATA_ACCESS: u32 = 0x0040_0000;
    std::fs::metadata(base.join(rel))
        .map(|m| m.file_attributes() & RECALL_ON_DATA_ACCESS == 0)
        .unwrap_or(false)
}

/// Convert a plain file (one that lost its placeholder status, e.g. after the sync
/// provider was disconnected across app restarts, which strands it "waiting to sync"
/// and un-freeable) back into a Cloud Filter placeholder. `CfConvertToPlaceholder`
/// needs a real Win32 file handle; the cloud-filter crate only exposes convert through
/// its oplock handle, which the API rejects with ERROR_INVALID_HANDLE, so we call it
/// directly on a `CreateFile`/std handle. With `dehydrate` the local data is dropped
/// (free up); without it the data is kept (green check). The uid is stored as the file
/// identity blob so a later hydrate / free-up can find the cloud file.
#[cfg(windows)]
fn convert_file_to_placeholder(path: &std::path::Path, uid: &str, dehydrate: bool) -> Result<(), String> {
    use std::os::windows::io::AsRawHandle;
    use windows::Win32::Foundation::HANDLE;
    use windows::Win32::Storage::CloudFilters::{
        CfConvertToPlaceholder, CF_CONVERT_FLAG_DEHYDRATE, CF_CONVERT_FLAG_MARK_IN_SYNC,
    };
    let file = std::fs::OpenOptions::new()
        .read(true)
        .write(true)
        .open(path)
        .map_err(|e| format!("open: {e}"))?;
    let blob = uid.as_bytes();
    let (id_ptr, id_len) = if blob.is_empty() {
        (None, 0u32)
    } else {
        (Some(blob.as_ptr() as *const core::ffi::c_void), blob.len() as u32)
    };
    let flags = if dehydrate {
        CF_CONVERT_FLAG_MARK_IN_SYNC | CF_CONVERT_FLAG_DEHYDRATE
    } else {
        CF_CONVERT_FLAG_MARK_IN_SYNC
    };
    unsafe {
        CfConvertToPlaceholder(HANDLE(file.as_raw_handle() as _), id_ptr, id_len, flags, None, None)
    }
    .map_err(|e| format!("{e:?}"))
}

/// Convert our subfolders (`Photos\`, `Albums\`, each album) to in-sync placeholders.
/// A folder freshly created inside a sync root otherwise reads as "sync pending" in
/// Explorer's status column. Best-effort (cosmetic; a failure changes nothing else).
#[cfg(windows)]
fn mark_folders_in_sync(root: &std::path::Path) {
    let _ = mark_one_in_sync(&root.join("Photos"));
    let albums = root.join("Albums");
    if albums.is_dir() {
        let _ = mark_one_in_sync(&albums);
        if let Ok(entries) = std::fs::read_dir(&albums) {
            for e in entries.flatten() {
                if e.file_type().map(|t| t.is_dir()).unwrap_or(false) {
                    let _ = mark_one_in_sync(&e.path());
                }
            }
        }
    }
}

// ---- Selective per-album sync (keep a chosen album's photos on the device) ----

/// albumUid -> the album-folder placeholder paths (relative to the sync root) of its
/// photos, filled during populate so a "keep this album offline" toggle can hydrate
/// exactly the `Albums\<name>\` copies (so that Explorer folder fills, not just the
/// timeline copy).
#[cfg(windows)]
static ALBUM_INDEX: std::sync::OnceLock<
    std::sync::Mutex<std::collections::HashMap<String, Vec<String>>>,
> = std::sync::OnceLock::new();

#[cfg(windows)]
fn album_index() -> &'static std::sync::Mutex<std::collections::HashMap<String, Vec<String>>> {
    ALBUM_INDEX.get_or_init(|| std::sync::Mutex::new(std::collections::HashMap::new()))
}

#[cfg(windows)]
fn synced_albums_path(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    crate::secure_store::app_dir(app).ok().map(|d| d.join("synced_albums.txt"))
}

/// The album uids the user chose to keep offline (empty if none).
#[cfg(windows)]
fn load_synced_albums(app: &tauri::AppHandle) -> std::collections::HashSet<String> {
    synced_albums_path(app)
        .and_then(|p| std::fs::read_to_string(p).ok())
        .map(|t| t.lines().map(str::trim).filter(|l| !l.is_empty()).map(String::from).collect())
        .unwrap_or_default()
}

#[cfg(windows)]
fn save_synced_albums(app: &tauri::AppHandle, set: &std::collections::HashSet<String>) {
    if let Some(p) = synced_albums_path(app) {
        let list: Vec<&str> = set.iter().map(String::as_str).collect();
        let _ = std::fs::write(p, list.join("\n"));
    }
}

/// Hydrate every not-yet-local photo of one album (its `Albums\<name>\` copies, so
/// that Explorer folder ends up filled).
#[cfg(windows)]
fn hydrate_album(app: &tauri::AppHandle, album_uid: &str) {
    let base = sync_root_path();
    let rels: Vec<String> = album_index().lock().unwrap().get(album_uid).cloned().unwrap_or_default();
    // rel -> photo uid, so a stranded regular file can be converted back with its blob.
    let rev: std::collections::HashMap<String, String> = {
        let index = mount_index().lock().unwrap();
        let mut m = std::collections::HashMap::new();
        for (u, rs) in index.iter() {
            for r in rs {
                m.insert(r.clone(), u.clone());
            }
        }
        m
    };
    let mut n = 0usize;
    for rel in &rels {
        if !is_hydrated(&base, rel) && keep_offline_one(app, &base, rel, rev.get(rel).map(String::as_str)) {
            n += 1;
        }
    }
    if n > 0 {
        crate::note(app, &format!("[album-sync] kept {n} offline"));
    }
}

/// The album uids currently kept offline, for the Albums view toggles.
#[tauri::command]
pub fn synced_albums(app: tauri::AppHandle) -> Vec<String> {
    #[cfg(windows)]
    {
        load_synced_albums(&app).into_iter().collect()
    }
    #[cfg(not(windows))]
    {
        let _ = app;
        Vec::new()
    }
}

/// Toggle "keep this album on this device". Enabling hydrates its photos now and
/// (via populate) keeps future additions to the album downloaded too. Disabling
/// stops the auto-sync but leaves already-downloaded photos in place.
#[tauri::command]
pub fn set_album_synced(app: tauri::AppHandle, uid: String, enabled: bool) {
    #[cfg(windows)]
    {
        let mut set = load_synced_albums(&app);
        if enabled {
            set.insert(uid.clone());
        } else {
            set.remove(&uid);
        }
        save_synced_albums(&app, &set);
        if enabled {
            std::thread::spawn(move || {
                set_busy(&app, true);
                hydrate_album(&app, &uid);
                set_busy(&app, false);
            });
        }
    }
    #[cfg(not(windows))]
    let _ = (app, uid, enabled);
}

/// Re-mark a hydrated file as in-sync. A read-only provider (we never upload) must
/// do this, or the write-time bump from hydration reads as a local change and the
/// file is stranded on "waiting to sync", which also blocks "Free up space".
#[cfg(windows)]
fn mark_path_in_sync(app: &tauri::AppHandle, path: &std::path::Path) {
    use cloud_filter::placeholder::OpenOptions;
    match OpenOptions::new().write_access().open(path) {
        Ok(mut ph) => match ph.mark_in_sync(true, None) {
            Ok(_) => crate::note(app, "[cloud] re-marked in-sync after hydrate"),
            Err(e) => crate::note(app, &format!("[cloud] mark-in-sync failed: {e:?}")),
        },
        Err(e) => crate::note(app, &format!("[cloud] mark-in-sync open failed: {e:?}")),
    }
}

/// The Cloud Filter sync engine. When Explorer opens a placeholder, `fetch_data`
/// downloads the file through the sidecar and streams it into the placeholder.
#[cfg(windows)]
struct ProtonSyncFilter {
    app: tauri::AppHandle,
}

#[cfg(windows)]
impl cloud_filter::filter::SyncFilter for ProtonSyncFilter {
    fn fetch_data(
        &self,
        request: cloud_filter::filter::Request,
        ticket: cloud_filter::filter::ticket::FetchData,
        _info: cloud_filter::filter::info::FetchData,
    ) -> cloud_filter::error::CResult<()> {
        use cloud_filter::error::CloudErrorKind;
        use cloud_filter::utility::WriteAt;
        use std::io::Read;

        let uid = String::from_utf8_lossy(request.file_blob()).into_owned();
        let want = request.file_size();
        crate::note(&self.app, &format!("[cloud] hydrate start (size={want})"));
        // The sidecar streams the download to a temp file; we transfer that into the
        // placeholder a chunk at a time so a large video never sits in memory.
        let (temp, got) = crate::hydrate_to_temp(&self.app, &uid).map_err(|e| {
            crate::note(&self.app, &format!("[cloud] hydrate download failed: {e}"));
            CloudErrorKind::NetworkUnavailable
        })?;
        // Refuse a wrong-sized transfer instead of writing a broken partial. A short
        // read would leave the placeholder half-hydrated and stranded — undeletable,
        // with the shell reporting "the cloud provider is not running"; a long read
        // means the declared size is wrong. Aborting here writes nothing, so the file
        // stays a clean cloud-only placeholder that can be reopened or deleted.
        if got == 0 || got != want {
            crate::note(&self.app, &format!("[cloud] hydrate aborted (got {got} want {want})"));
            let _ = std::fs::remove_file(&temp);
            return Err(CloudErrorKind::ValidationFailed);
        }

        // Stream the temp file into the placeholder. The OS requires each transfer to
        // be 4KiB or to end exactly on the file size, so send full 4KiB chunks with a
        // smaller final chunk, holding only one chunk in memory at a time.
        const CHUNK: usize = 4096;
        let transfer = (|| -> Result<(), CloudErrorKind> {
            let mut f = std::fs::File::open(&temp).map_err(|e| {
                crate::note(&self.app, &format!("[cloud] hydrate open temp failed: {e:?}"));
                CloudErrorKind::Unsuccessful
            })?;
            let mut buf = vec![0u8; CHUNK];
            let mut offset = 0u64;
            let mut remaining = got;
            while remaining > 0 {
                let this = std::cmp::min(CHUNK as u64, remaining) as usize;
                f.read_exact(&mut buf[..this]).map_err(|e| {
                    crate::note(&self.app, &format!("[cloud] hydrate read temp failed: {e:?}"));
                    CloudErrorKind::Unsuccessful
                })?;
                ticket.write_at(&buf[..this], offset).map_err(|e| {
                    crate::note(&self.app, &format!("[cloud] transfer failed at {offset}: {e:?}"));
                    CloudErrorKind::InvalidRequest
                })?;
                offset += this as u64;
                remaining -= this as u64;
                let _ = ticket.report_progress(got, offset);
            }
            Ok(())
        })();
        let _ = std::fs::remove_file(&temp);
        transfer?;
        crate::note(&self.app, &format!("[cloud] hydrate done ({got} bytes)"));
        // Re-mark in-sync once the hydration handle is released, so the file can be
        // freed up later instead of being stranded on "waiting to sync".
        let path = request.path();
        let app = self.app.clone();
        std::thread::spawn(move || {
            std::thread::sleep(std::time::Duration::from_millis(700));
            mark_path_in_sync(&app, &path);
        });
        Ok(())
    }

    fn dehydrate(
        &self,
        _request: cloud_filter::filter::Request,
        ticket: cloud_filter::filter::ticket::Dehydrate,
        _info: cloud_filter::filter::info::Dehydrate,
    ) -> cloud_filter::error::CResult<()> {
        // Approve "free up space": the local data is dropped and the file goes back
        // to a dehydrated cloud placeholder (green cloud, still in sync). Logged so
        // a "stuck on waiting to sync" report shows whether Windows even reaches the
        // provider (if this line is absent from the log, the file was not in-sync and
        // Windows blocked the free-up before calling us).
        crate::note(&self.app, "[cloud] dehydrate (free up space) requested");
        match ticket.pass() {
            Ok(()) => {
                crate::note(&self.app, "[cloud] dehydrate approved");
                Ok(())
            }
            Err(e) => {
                crate::note(&self.app, &format!("[cloud] dehydrate pass failed: {e:?}"));
                Err(cloud_filter::error::CloudErrorKind::InvalidRequest)
            }
        }
    }
}

/// Create dehydrated placeholders (green cloud) for the cloud photos. Called by the
/// frontend once the timeline has loaded (so the sidecar is signed in). Runs off
/// the main thread; per-photo errors are non-fatal.
#[tauri::command]
pub fn populate_mount(app: tauri::AppHandle) {
    #[cfg(windows)]
    std::thread::spawn(move || {
        set_busy(&app, true);
        // Startup pass: honours the "auto-download new photos" setting.
        if let Err(e) = try_populate(&app, true) {
            eprintln!("[cloud_mount] populate failed: {e}");
        }
        set_busy(&app, false);
    });
    #[cfg(not(windows))]
    let _ = app;
}

/// The tray "Sync now" action. Deliberately lighter than a startup populate: it
/// refreshes the placeholders and pulls only what the user has opted into (the albums
/// kept offline), then asks the open window to reload its view. It NEVER runs the
/// whole-library auto-download, so the button can never start downloading the entire
/// library. Safe to press at any time.
#[tauri::command]
pub fn sync_now(app: tauri::AppHandle) {
    #[cfg(windows)]
    std::thread::spawn(move || {
        set_busy(&app, true);
        // `false` = never auto-download the whole library; only synced albums sync.
        if let Err(e) = try_populate(&app, false) {
            eprintln!("[cloud_mount] sync_now failed: {e}");
        }
        set_busy(&app, false);
        // Reload the open window's timeline / albums, like a manual refresh.
        use tauri::Emitter;
        let _ = app.emit("refresh-view", ());
    });
    #[cfg(not(windows))]
    let _ = app;
}

/// Build (or refresh) the cloud placeholders. `auto_download` gates the "keep every
/// new photo on this device" pass: on by the setting during a startup populate, always
/// off for the tray "Sync now" so that button can never bulk-download the library.
#[cfg(windows)]
fn try_populate(app: &tauri::AppHandle, auto_download: bool) -> Result<(), String> {
    use cloud_filter::metadata::{Metadata, MetadataExt};
    use cloud_filter::placeholder_file::PlaceholderFile;
    use std::collections::{HashMap, HashSet};

    let folder = sync_root_path();
    std::fs::create_dir_all(&folder).map_err(|e| e.to_string())?;
    // Idempotent across an unexpected second run in one process.
    mount_index().lock().unwrap().clear();
    cleanup_stale_root(&folder);

    let photos_dir = folder.join("Photos");
    std::fs::create_dir_all(&photos_dir).map_err(|e| e.to_string())?;

    // Page through the photos so the sidecar RPC lock is released between pages,
    // keeping the app responsive (thumbnails keep loading) during populate.
    const PAGE: u64 = 40;
    let mut offset = 0u64;
    let mut made = 0usize;
    let mut reconciled = 0usize;
    let mut photos_seen: HashSet<String> = HashSet::new();
    // uid -> (sanitized base name, size, filetime), reused to place the same photo
    // inside its albums without a second round of getNode lookups.
    let mut meta: HashMap<String, (String, u64, i64)> = HashMap::new();
    // Every photo uid seen this pass, in order — the baseline for auto-download.
    let mut all_uids: Vec<String> = Vec::new();

    loop {
        let result = crate::sidecar_rpc(
            app,
            "listForMount",
            serde_json::json!({ "offset": offset, "limit": PAGE }),
        )?;
        let items = result.get("items").and_then(|v| v.as_array()).cloned().unwrap_or_default();
        let total = result.get("total").and_then(|v| v.as_u64()).unwrap_or(0);
        if items.is_empty() {
            break;
        }

        for item in &items {
            let uid = item.get("uid").and_then(|v| v.as_str()).unwrap_or_default();
            let size = item.get("size").and_then(|v| v.as_u64()).unwrap_or(0);
            if uid.is_empty() || size == 0 {
                continue;
            }
            let name = item.get("name").and_then(|v| v.as_str()).unwrap_or(uid);
            let ft = unix_ms_to_filetime(item.get("captureTime").and_then(|v| v.as_i64()).unwrap_or(0));
            let base = sanitize_name(name);
            let unique = unique_name(&base, &mut photos_seen);
            index_push(uid, &format!("Photos\\{unique}"));
            meta.insert(uid.to_string(), (base, size, ft));
            all_uids.push(uid.to_string());

            let placeholder = PlaceholderFile::new(&unique)
                .mark_in_sync() // it faithfully mirrors the cloud file: in sync, not "pending"
                .metadata(Metadata::file().size(size).creation_time(ft).last_write_time(ft))
                .blob(uid.as_bytes().to_vec());
            if placeholder.create::<&std::path::Path>(&photos_dir).is_ok() {
                made += 1;
            } else if reconcile_existing(app, &photos_dir.join(&unique), uid) {
                // A copy from a previous install already sits here (create only fails
                // on a name collision). Reconcile it so it is not stranded on "waiting
                // to sync" and the app still sees it as kept offline.
                reconciled += 1;
            }
        }

        offset += PAGE;
        if total > 0 && offset >= total {
            break;
        }
        // Let the app's thumbnail RPCs run before the next page.
        std::thread::sleep(std::time::Duration::from_millis(250));
    }
    crate::note(
        app,
        &format!("[cloud] populate: created {made} photo placeholders, reconciled {reconciled} existing"),
    );

    // One subfolder per album, holding placeholders for its photos (the same cloud
    // files, backed by the same uid, hydrated on demand).
    populate_albums(app, &folder.join("Albums"), &meta);

    // Auto-download: keep photos that appeared since the previous populate on this
    // device. The snapshot from the last run is the baseline; a first run (no snapshot)
    // only seeds it, so enabling the option never bulk-downloads the whole existing
    // library — only genuine new arrivals from then on. Guarded three ways so it can
    // never run away: the caller opts in (`auto_download`), the setting is on, and the
    // baseline is a real, non-empty snapshot (an empty/missing one means "seed", not
    // "everything is new"). And the snapshot is only saved when this listing actually
    // returned photos, so a transient empty listing cannot poison the next run.
    if auto_download && auto_download_enabled() {
        if let Some(prev) = load_seen(app) {
            if !prev.is_empty() {
                let index = mount_index().lock().unwrap();
                let mut grabbed = 0usize;
                for uid in &all_uids {
                    if prev.contains(uid) {
                        continue;
                    }
                    if let Some(rel) = index.get(uid).and_then(|v| v.first()) {
                        if keep_offline_one(app, &folder, rel, Some(uid.as_str())) {
                            grabbed += 1;
                        }
                    }
                }
                if grabbed > 0 {
                    crate::note(app, &format!("[autodl] downloaded {grabbed} new photo(s)"));
                }
            }
        }
    }
    if !all_uids.is_empty() {
        save_seen(app, &all_uids);
    }

    // Selective per-album sync: keep every photo of a "synced" album on the device,
    // catching photos newly added to those albums since the last populate.
    for album_uid in load_synced_albums(app) {
        hydrate_album(app, &album_uid);
    }

    // Settle the folders' Explorer status (a fresh sync-root folder reads as pending
    // until it is an in-sync placeholder). Done last, after all hydration.
    mark_folders_in_sync(&folder);

    Ok(())
}

/// Create the `Albums\<name>\` subfolders and a placeholder for each album photo,
/// reusing the name/size/time gathered in the main photo pass so no extra network
/// calls are made. Best-effort: a missing album or photo is skipped, not fatal.
#[cfg(windows)]
fn populate_albums(
    app: &tauri::AppHandle,
    albums_dir: &std::path::Path,
    meta: &std::collections::HashMap<String, (String, u64, i64)>,
) {
    use cloud_filter::metadata::{Metadata, MetadataExt};
    use cloud_filter::placeholder_file::PlaceholderFile;
    use std::collections::HashSet;

    let albums = match crate::sidecar_rpc(app, "listAlbumsForMount", serde_json::json!({})) {
        Ok(v) => v.as_array().cloned().unwrap_or_default(),
        Err(e) => {
            crate::note(app, &format!("[cloud] albums skipped: {e}"));
            return;
        }
    };
    album_index().lock().unwrap().clear();
    if albums.is_empty() {
        return;
    }
    let _ = std::fs::create_dir_all(albums_dir);

    let mut album_dir_seen: HashSet<String> = HashSet::new();
    let mut made = 0usize;
    for album in &albums {
        let album_uid = album.get("uid").and_then(|v| v.as_str()).unwrap_or_default();
        let name = album.get("name").and_then(|v| v.as_str()).unwrap_or("Album");
        let uids = album.get("uids").and_then(|v| v.as_array()).cloned().unwrap_or_default();
        if uids.is_empty() {
            continue;
        }
        let dir_name = unique_name(&sanitize_name(name), &mut album_dir_seen);
        let album_folder = albums_dir.join(&dir_name);
        if std::fs::create_dir_all(&album_folder).is_err() {
            continue;
        }
        let mut file_seen: HashSet<String> = HashSet::new();
        let mut members: Vec<String> = Vec::new();
        for u in &uids {
            let Some(uid) = u.as_str() else { continue };
            let Some((base, size, ft)) = meta.get(uid) else { continue };
            let unique = unique_name(base, &mut file_seen);
            let rel = format!("Albums\\{dir_name}\\{unique}");
            let placeholder = PlaceholderFile::new(&unique)
                .mark_in_sync()
                .metadata(Metadata::file().size(*size).creation_time(*ft).last_write_time(*ft))
                .blob(uid.as_bytes().to_vec());
            if placeholder.create::<&std::path::Path>(&album_folder).is_ok() {
                made += 1;
            } else {
                // A copy from a previous install already sits here: reconcile it so
                // Explorer shows the green check instead of "waiting to sync".
                reconcile_existing(app, &album_folder.join(&unique), uid);
            }
            // Index every copy either way, so album-sync and free-up act on this
            // `Albums\` copy even when it pre-existed and create was skipped.
            index_push(uid, &rel);
            members.push(rel);
        }
        if !album_uid.is_empty() {
            album_index().lock().unwrap().insert(album_uid.to_string(), members);
        }
    }
    crate::note(app, &format!("[cloud] populate: created {made} album placeholders"));
}

/// Make a file name unique within this populate run (append " (2)", " (3)", ...),
/// so two photos with the same name both land instead of one colliding out.
#[cfg(windows)]
fn unique_name(base: &str, seen: &mut std::collections::HashSet<String>) -> String {
    if seen.insert(base.to_lowercase()) {
        return base.to_string();
    }
    let (stem, ext) = match base.rfind('.') {
        Some(i) if i > 0 => (&base[..i], &base[i..]),
        _ => (base, ""),
    };
    for n in 2..100_000 {
        let candidate = format!("{stem} ({n}){ext}");
        if seen.insert(candidate.to_lowercase()) {
            return candidate;
        }
    }
    base.to_string()
}

/// "Download" from the app = keep the selected photos offline: pin their Explorer
/// placeholders, which the OS then hydrates in place (fetch_data downloads them).
/// One entry per photo, ending as a green check — no duplicate file, no "waiting to
/// sync". Runs off the main thread; unknown uids (not yet populated) are skipped.
#[tauri::command]
pub fn pin_selected(app: tauri::AppHandle, uids: Vec<String>) {
    #[cfg(windows)]
    std::thread::spawn(move || {
        let base = sync_root_path();
        // The primary (`Photos\`) copy of each selection, paired with its uid. Album
        // copies stay cloud-only until opened, so a download never silently duplicates
        // every album photo on disk. Keeping offline never pins ("always keep"), which
        // is what made "Free up space" fail with 0x8007017B.
        let pairs: Vec<(String, String)> = {
            let index = mount_index().lock().unwrap();
            uids.iter()
                .filter_map(|u| index.get(u).and_then(|v| v.first()).map(|rel| (u.clone(), rel.clone())))
                .collect()
        };
        crate::note(
            &app,
            &format!("[download] make offline: {} of {} selected found in the mount", pairs.len(), uids.len()),
        );
        let ok = pairs
            .iter()
            .filter(|(uid, rel)| keep_offline_one(&app, &base, rel, Some(uid.as_str())))
            .count();
        crate::note(&app, &format!("[download] kept {ok} offline (freeable)"));
    });
    #[cfg(not(windows))]
    let _ = (app, uids);
}

/// App-side "remove download / free up space": dehydrate the selected files back to
/// cloud-only placeholders via `CfDehydratePlaceholder` directly. This is the
/// provider's own dehydrate call and does NOT go through Explorer's "Free up space"
/// (which a not-in-sync placeholder blocks before the callback). Logs the exact
/// error per file, so a failure pinpoints the cause.
#[tauri::command]
pub fn free_up_selected(app: tauri::AppHandle, uids: Vec<String>) {
    #[cfg(windows)]
    std::thread::spawn(move || {
        use cloud_filter::ext::FileExt;
        use std::os::windows::fs::MetadataExt;
        const RECALL_ON_DATA_ACCESS: u32 = 0x0040_0000;
        let base = sync_root_path();
        // Free every copy (the `Photos\` one and each album), paired with its uid so a
        // copy that lost its placeholder status can be converted back with its blob.
        let pairs: Vec<(String, Vec<String>)> = {
            let index = mount_index().lock().unwrap();
            uids.iter().filter_map(|u| index.get(u).map(|r| (u.clone(), r.clone()))).collect()
        };
        let mut ok = 0usize;
        for (uid, rels) in pairs {
            for rel in rels {
                let path = base.join(&rel);
                // Skip a copy that is already cloud-only (e.g. an unopened album copy).
                match std::fs::metadata(&path) {
                    Ok(meta) if meta.file_attributes() & RECALL_ON_DATA_ACCESS != 0 => continue,
                    Ok(_) => {}
                    Err(_) => continue,
                }
                // Normal path: dehydrate the placeholder in place.
                if let Ok(file) = std::fs::OpenOptions::new().read(true).write(true).open(&path) {
                    if file.dehydrate(..).is_ok() {
                        ok += 1;
                        continue;
                    }
                }
                // A placeholder left not-in-sync by a failed/interrupted hydrate blocks
                // the dehydrate above (and the shell's own delete, which reports "the
                // cloud provider is not running"). Force it back in-sync, then dehydrate,
                // to reset it to a clean cloud-only placeholder that deletes normally.
                {
                    use cloud_filter::placeholder::OpenOptions;
                    if let Ok(mut ph) = OpenOptions::new().write_access().open(&path) {
                        if ph.info().ok().flatten().is_some() {
                            let _ = ph.mark_in_sync(true, None);
                        }
                    } // release the oplock handle before the std dehydrate
                    if let Ok(file) = std::fs::OpenOptions::new().read(true).write(true).open(&path) {
                        if file.dehydrate(..).is_ok() {
                            ok += 1;
                            continue;
                        }
                    }
                }
                // The copy lost its placeholder status (a plain "waiting to sync" file, so
                // CfDehydratePlaceholder fails with "not a cloud file"): convert it straight
                // to a DEHYDRATED placeholder, which reclaims the space and restores the
                // cloud status in one step.
                match convert_file_to_placeholder(&path, &uid, true) {
                    Ok(()) => ok += 1,
                    // No file name / uid in the log — just the outcome and the OS error.
                    Err(e) => crate::note(&app, &format!("[freeup] convert-dehydrate failed: {e}")),
                }
            }
        }
        crate::note(&app, &format!("[freeup] freed {ok}"));
    });
    #[cfg(not(windows))]
    let _ = (app, uids);
}

/// The uids whose placeholder is hydrated (kept offline, "available on this
/// device"), so the app can badge them. A dehydrated cloud-only placeholder carries
/// RECALL_ON_DATA_ACCESS; that flag is cleared once it is hydrated.
#[tauri::command]
pub fn hydrated_uids() -> Vec<String> {
    #[cfg(windows)]
    {
        use std::os::windows::fs::MetadataExt;
        const RECALL_ON_DATA_ACCESS: u32 = 0x0040_0000;
        let base = sync_root_path();
        let index = mount_index().lock().unwrap();
        index
            .iter()
            .filter_map(|(uid, rels)| {
                // Local if any copy (the `Photos\` one or an album) is hydrated.
                let any = rels.iter().any(|rel| {
                    std::fs::metadata(base.join(rel))
                        .map(|m| m.file_attributes() & RECALL_ON_DATA_ACCESS == 0)
                        .unwrap_or(false)
                });
                any.then(|| uid.clone())
            })
            .collect()
    }
    #[cfg(not(windows))]
    Vec::new()
}
