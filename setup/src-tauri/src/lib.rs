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

// Photos for Proton installer. A small Tauri app that carries the whole app
// (app.exe + sidecar.exe + sidecar/) as an embedded zip and, on the user's
// confirmation, extracts it to a chosen folder, creates shortcuts, and registers
// an uninstaller in Add/Remove Programs. Run with `--uninstall` it reverses all
// of that (and removes the app's data).

use std::fs;
use std::io::Cursor;
use std::path::{Path, PathBuf};
use tauri::Manager;

const APP_NAME: &str = "Photos for Proton";
const PACK_ID: &str = "PhotosForProton"; // Add/Remove-Programs key
const VERSION: &str = "0.1.0";
const PUBLISHER: &str = "Akoos";
const DATA_DIR_NAME: &str = "eu.akoos.photos.desktop"; // where the app keeps its vault/caches

// The app itself, zipped at build time by build-setup.ps1.
static PAYLOAD: &[u8] = include_bytes!("../payload/payload.zip");

fn local_app_data() -> PathBuf {
    PathBuf::from(std::env::var("LOCALAPPDATA").unwrap_or_default())
}
fn desktop_dir() -> PathBuf {
    PathBuf::from(std::env::var("USERPROFILE").unwrap_or_default()).join("Desktop")
}
fn start_menu_dir() -> PathBuf {
    PathBuf::from(std::env::var("APPDATA").unwrap_or_default())
        .join("Microsoft")
        .join("Windows")
        .join("Start Menu")
        .join("Programs")
}
fn data_dir() -> PathBuf {
    local_app_data().join(DATA_DIR_NAME)
}

/// Uninstall when explicitly asked (`--uninstall`, as the Add/Remove-Programs
/// entry passes) OR when this executable IS the installed `uninstall.exe`, so a
/// plain double-click on it uninstalls instead of starting a fresh install.
/// Pure decision (unit-tested): uninstall if `--uninstall` is present OR this exe
/// is the installed `uninstall.exe` (a plain double-click on it).
fn wants_uninstall(args: &[String], exe_name: Option<&str>) -> bool {
    args.iter().any(|a| a == "--uninstall")
        || exe_name
            .map(|n| n.eq_ignore_ascii_case("uninstall.exe"))
            .unwrap_or(false)
}

fn is_uninstall() -> bool {
    let args: Vec<String> = std::env::args().collect();
    let exe = std::env::current_exe().ok();
    let name = exe.as_ref().and_then(|p| p.file_name()).and_then(|n| n.to_str());
    wants_uninstall(&args, name)
}

#[cfg(test)]
mod tests {
    use super::wants_uninstall;

    #[test]
    fn uninstall_when_flag_present() {
        assert!(wants_uninstall(&["--uninstall".to_string()], Some("Setup.exe")));
    }

    #[test]
    fn uninstall_when_named_uninstall_exe_case_insensitive() {
        assert!(wants_uninstall(&[], Some("uninstall.exe")));
        assert!(wants_uninstall(&[], Some("UNINSTALL.EXE")));
    }

    #[test]
    fn install_by_default() {
        assert!(!wants_uninstall(&[], Some("Photos-for-Proton-Setup.exe")));
        assert!(!wants_uninstall(&["--silent".to_string()], Some("setup.exe")));
        assert!(!wants_uninstall(&[], None));
    }
}

#[tauri::command]
fn mode() -> String {
    if is_uninstall() {
        "uninstall".into()
    } else {
        "install".into()
    }
}

fn default_dir_impl() -> String {
    local_app_data().join(APP_NAME).to_string_lossy().into_owned()
}

#[tauri::command]
fn default_dir() -> String {
    default_dir_impl()
}

#[cfg(windows)]
fn read_install_location() -> Option<String> {
    use winreg::enums::HKEY_CURRENT_USER;
    use winreg::RegKey;
    let key = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey(format!(
            "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{PACK_ID}"
        ))
        .ok()?;
    let loc: String = key.get_value("InstallLocation").ok()?;
    (!loc.is_empty()).then_some(loc)
}
#[cfg(not(windows))]
fn read_install_location() -> Option<String> {
    None
}

/// The directory of an existing installation (present in the registry AND still
/// on disk), so the installer can offer to uninstall instead of installing a
/// second copy.
#[tauri::command]
fn existing_install() -> Option<String> {
    read_install_location().filter(|p| Path::new(p).exists())
}

/// Reveal the window once the UI has painted; it starts hidden so the user never
/// sees the empty transparent frame flash while the WebView loads.
#[tauri::command]
fn show_window(window: tauri::Window) {
    let _ = window.show();
}

fn extract_payload(dest: &Path) -> Result<(), String> {
    let mut archive =
        zip::ZipArchive::new(Cursor::new(PAYLOAD)).map_err(|e| format!("open payload: {e}"))?;
    for i in 0..archive.len() {
        let mut entry = archive.by_index(i).map_err(|e| e.to_string())?;
        let Some(rel) = entry.enclosed_name() else {
            continue; // skip unsafe paths
        };
        let out = dest.join(rel);
        if entry.is_dir() {
            fs::create_dir_all(&out).map_err(|e| e.to_string())?;
        } else {
            if let Some(parent) = out.parent() {
                fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
            let mut f = fs::File::create(&out).map_err(|e| format!("write {}: {e}", out.display()))?;
            std::io::copy(&mut entry, &mut f).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

fn make_shortcut(lnk: &Path, target: &Path) -> Result<(), String> {
    if let Some(parent) = lnk.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let sl = mslnk::ShellLink::new(target).map_err(|e| format!("shortcut: {e}"))?;
    sl.create_lnk(lnk).map_err(|e| format!("shortcut: {e}"))
}

#[cfg(windows)]
fn write_uninstall_entry(install: &Path, uninstaller: &Path, icon: &Path) -> Result<(), String> {
    use winreg::enums::HKEY_CURRENT_USER;
    use winreg::RegKey;
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let path = format!("Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{PACK_ID}");
    let (key, _) = hkcu.create_subkey(&path).map_err(|e| e.to_string())?;
    let s = |v: &Path| v.to_string_lossy().into_owned();
    key.set_value("DisplayName", &APP_NAME).map_err(|e| e.to_string())?;
    key.set_value("DisplayVersion", &VERSION).map_err(|e| e.to_string())?;
    key.set_value("Publisher", &PUBLISHER).map_err(|e| e.to_string())?;
    key.set_value("DisplayIcon", &s(icon)).map_err(|e| e.to_string())?;
    key.set_value("InstallLocation", &s(install)).map_err(|e| e.to_string())?;
    key.set_value(
        "UninstallString",
        &format!("\"{}\" --uninstall", uninstaller.display()),
    )
    .map_err(|e| e.to_string())?;
    key.set_value("NoModify", &1u32).map_err(|e| e.to_string())?;
    key.set_value("NoRepair", &1u32).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(not(windows))]
fn write_uninstall_entry(_: &Path, _: &Path, _: &Path) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
fn install(dir: String, desktop: bool, start_menu: bool, network_drive: bool) -> Result<(), String> {
    install_impl(dir, desktop, start_menu, network_drive)
}

fn install_impl(dir: String, desktop: bool, start_menu: bool, network_drive: bool) -> Result<(), String> {
    let target = PathBuf::from(&dir);
    fs::create_dir_all(&target).map_err(|e| format!("create {dir}: {e}"))?;
    extract_payload(&target)?;

    // Copy ourselves in as the uninstaller.
    let self_exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let uninstaller = target.join("uninstall.exe");
    fs::copy(&self_exe, &uninstaller).map_err(|e| format!("copy uninstaller: {e}"))?;

    let app_exe = target.join("app.exe");
    if desktop {
        make_shortcut(&desktop_dir().join(format!("{APP_NAME}.lnk")), &app_exe)?;
    }
    if start_menu {
        make_shortcut(&start_menu_dir().join(format!("{APP_NAME}.lnk")), &app_exe)?;
    }
    write_uninstall_entry(&target, &uninstaller, &app_exe)?;
    set_show_in_explorer_pref(network_drive);
    Ok(())
}

/// Update an existing install in place: replace its files with this (newer) exe's
/// payload and relaunch. Invoked as `<downloaded-setup>.exe --update` by the running
/// app, which quits first so its files unlock. Shortcuts, data and prefs are kept.
#[cfg(windows)]
fn update_impl() -> Result<(), String> {
    let loc = read_install_location().ok_or_else(|| "no existing installation to update".to_string())?;
    let install = PathBuf::from(&loc);
    // The app launched us then quit; make sure nothing under the folder still holds
    // a file, then overwrite the payload, retrying while app.exe finishes closing.
    kill_under_dir(&install);
    std::thread::sleep(std::time::Duration::from_millis(1200));
    let mut extracted = extract_payload(&install);
    let mut tries = 0;
    while extracted.is_err() && tries < 5 {
        tries += 1;
        kill_under_dir(&install);
        std::thread::sleep(std::time::Duration::from_millis(800));
        extracted = extract_payload(&install);
    }
    extracted?;
    // Refresh the uninstaller (this newer exe) and the Add/Remove-Programs entry.
    let self_exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let uninstaller = install.join("uninstall.exe");
    let _ = fs::copy(&self_exe, &uninstaller);
    let app_exe = install.join("app.exe");
    let _ = write_uninstall_entry(&install, &uninstaller, &app_exe);
    // Relaunch the updated app.
    std::process::Command::new(&app_exe)
        .current_dir(&install)
        .spawn()
        .map_err(|e| format!("relaunch: {e}"))?;
    Ok(())
}
#[cfg(not(windows))]
fn update_impl() -> Result<(), String> {
    Err("update is Windows-only".into())
}

#[tauri::command]
fn launch(dir: String) -> Result<(), String> {
    let exe = PathBuf::from(dir).join("app.exe");
    std::process::Command::new(exe)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(windows)]
fn remove_uninstall_entry() {
    use winreg::enums::HKEY_CURRENT_USER;
    use winreg::RegKey;
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let _ = hkcu.delete_subkey_all(format!(
        "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{PACK_ID}"
    ));
}
#[cfg(not(windows))]
fn remove_uninstall_entry() {}

/// Remove the Explorer "Proton Photos" cloud-provider (sync root) registration so
/// no ghost nav-pane entry is left behind. The proper API unregister also notifies
/// the shell to drop the entry — a raw registry delete does not, which is why it
/// lingered. The folder and the user's downloaded files are intentionally kept.
#[cfg(windows)]
fn remove_sync_root_registration() {
    // Proper unregister on a fresh COM-STA thread (the main thread's apartment may
    // differ); join so it finishes before we return.
    let _ = std::thread::spawn(|| {
        use cloud_filter::root::{SecurityId, SyncRootIdBuilder};
        use windows::Win32::System::Com::{CoInitializeEx, COINIT_APARTMENTTHREADED};
        unsafe {
            let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
        }
        if let Ok(sid) = SecurityId::current_user() {
            let id = SyncRootIdBuilder::new("ProtonPhotos").user_security_id(sid).build();
            if id.is_registered().unwrap_or(false) {
                let _ = id.unregister();
            }
        }
    })
    .join();

    // Fallback: delete any leftover SyncRootManager\ProtonPhotos!* keys directly.
    use winreg::enums::{HKEY_CURRENT_USER, KEY_READ, KEY_WRITE};
    use winreg::RegKey;
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let path = "Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\SyncRootManager";
    if let Ok(mgr) = hkcu.open_subkey_with_flags(path, KEY_READ | KEY_WRITE) {
        let ours: Vec<String> = mgr
            .enum_keys()
            .filter_map(|k| k.ok())
            .filter(|k| k.starts_with("ProtonPhotos!"))
            .collect();
        for name in ours {
            let _ = mgr.delete_subkey_all(&name);
        }
    }
}
#[cfg(not(windows))]
fn remove_sync_root_registration() {}

/// Write the "show in File Explorer" preference the app reads at startup (a shared
/// HKCU key with the app's Settings toggle).
#[cfg(windows)]
fn set_show_in_explorer_pref(enabled: bool) {
    use winreg::enums::HKEY_CURRENT_USER;
    use winreg::RegKey;
    if let Ok((key, _)) =
        RegKey::predef(HKEY_CURRENT_USER).create_subkey("Software\\PhotosForProton")
    {
        let _ = key.set_value("ShowInExplorer", &u32::from(enabled));
    }
}
#[cfg(not(windows))]
fn set_show_in_explorer_pref(_: bool) {}

// PowerShell run by the uninstaller. These are templates (not `format!`) so the
// many literal `{ }` of PowerShell stay out of Rust's brace-escaping; `__DIR__`
// and `__PID__` are substituted below. `__DIR__` is single-quote-escaped first, so
// it can never break out of the PowerShell string literal, and the match uses a
// trailing separator (`__DIR__\`) so a sibling folder with the same prefix is not
// caught. `taskkill /T` kills each match's whole child tree, which is what frees
// the folder: the WebView2 helper processes run from the Edge runtime (not from
// the install dir), so a plain per-image kill would leave them holding files.

/// Kill every process whose image lives under the install folder, and their child
/// trees, skipping this running uninstaller itself.
#[cfg(windows)]
const KILL_TEMPLATE: &str = r#"
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
  Where-Object { $_.ExecutablePath -and $_.ExecutablePath.StartsWith('__DIR__\', 'OrdinalIgnoreCase') -and $_.ProcessId -ne __PID__ } |
  ForEach-Object { & taskkill /F /T /PID $_.ProcessId 2>$null }
"#;

/// Wait for the uninstaller to exit, kill any straggler under the folder (tree and
/// all), then remove the folder, retrying past the brief WebView2 file locks.
#[cfg(windows)]
const CLEANUP_TEMPLATE: &str = r#"
$log = Join-Path ([Environment]::GetFolderPath('Desktop')) 'pfp-uninstall.log'
function L($m) { try { Add-Content -LiteralPath $log -Value ((Get-Date -Format 'HH:mm:ss') + ' ' + $m) } catch {} }
L 'start dir=[__DIR__] self=[__SELF__] pid=__PID__'
try { Wait-Process -Id __PID__ -Timeout 60 -ErrorAction SilentlyContinue } catch {}
L 'uninstaller exited'
if ('__SELF__' -ne '') {
  for ($i = 0; $i -lt 40; $i++) {
    Remove-Item -LiteralPath '__SELF__' -Force -ErrorAction SilentlyContinue
    if (-not (Test-Path -LiteralPath '__SELF__')) { L ('moved exe removed after ' + $i); break }
    Start-Sleep -Milliseconds 300
  }
}
if (Test-Path -LiteralPath '__DIR__') {
  L 'folder still present; killing stragglers then removing'
  Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object { $_.ExecutablePath -and $_.ExecutablePath.StartsWith('__DIR__\', 'OrdinalIgnoreCase') } |
    ForEach-Object { & taskkill /F /T /PID $_.ProcessId 2>$null }
  for ($i = 0; $i -lt 40; $i++) {
    Remove-Item -LiteralPath '__DIR__' -Recurse -Force -ErrorAction SilentlyContinue
    if (-not (Test-Path -LiteralPath '__DIR__')) { L ('folder removed after ' + $i); break }
    Start-Sleep -Milliseconds 300
  }
} else { L 'folder already gone (removed synchronously)' }
if (Test-Path -LiteralPath '__DIR__') { L 'STILL PRESENT:'; Get-ChildItem -LiteralPath '__DIR__' -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object { L ('  left ' + $_.FullName) } }
L 'cleanup finished'
Remove-Item -LiteralPath $PSCommandPath -Force -ErrorAction SilentlyContinue
"#;

#[cfg(windows)]
fn build_script(template: &str, install: &Path) -> String {
    let dir = install.display().to_string().replace('\'', "''");
    template
        .replace("__DIR__", &dir)
        .replace("__PID__", &std::process::id().to_string())
}

/// Close the running app right now (synchronously): its WebView2 children hold
/// files in the folder, and the user should see it exit the instant they confirm.
#[cfg(windows)]
fn kill_under_dir(install: &Path) {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x0800_0000;
    let script = build_script(KILL_TEMPLATE, install);
    let _ = std::process::Command::new("powershell")
        .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", &script])
        .creation_flags(CREATE_NO_WINDOW)
        .output(); // block until the kills finish
}
#[cfg(not(windows))]
fn kill_under_dir(_: &Path) {}

/// The uninstaller runs from `<install>\uninstall.exe`, so it cannot delete its
/// own directory while running. Hand that off to a detached process that waits
/// for us to exit, then removes the folder.
/// Best-effort detached step AFTER the folder has already been removed
/// synchronously: delete our own exe once we exit (it was moved to `moved_self`
/// outside the folder), and, only if a locked straggler kept the folder, retry
/// removing it. Writes a diagnostic log to the Desktop.
#[cfg(windows)]
fn spawn_detached_cleanup(install: &Path, moved_self: Option<&Path>) {
    use std::os::windows::process::CommandExt;
    const DETACHED_PROCESS: u32 = 0x0000_0008;
    const CREATE_NO_WINDOW: u32 = 0x0800_0000;
    const CREATE_BREAKAWAY_FROM_JOB: u32 = 0x0100_0000;
    let dir = install.display().to_string().replace('\'', "''");
    let self_str = moved_self
        .map(|p| p.display().to_string().replace('\'', "''"))
        .unwrap_or_default();
    let script = CLEANUP_TEMPLATE
        .replace("__DIR__", &dir)
        .replace("__SELF__", &self_str)
        .replace("__PID__", &std::process::id().to_string());
    let temp = std::env::temp_dir();
    let ps1 = temp.join(format!("pfp-cleanup-{}.ps1", std::process::id()));
    if std::fs::write(&ps1, script).is_err() {
        return;
    }
    // Break away from the uninstaller's job object (a Programs-list launch may put
    // it in a kill-on-close job that would kill this child on our exit); fall back
    // to a plain detached spawn where breakaway is not permitted.
    let ps1_path = ps1.clone();
    let spawn = |flags: u32| {
        std::process::Command::new("powershell")
            .args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-File"])
            .arg(&ps1_path)
            .current_dir(&temp)
            .creation_flags(flags)
            .spawn()
    };
    let _ = spawn(DETACHED_PROCESS | CREATE_NO_WINDOW | CREATE_BREAKAWAY_FROM_JOB)
        .or_else(|_| spawn(DETACHED_PROCESS | CREATE_NO_WINDOW));
}
#[cfg(not(windows))]
fn spawn_detached_cleanup(_: &Path, _: Option<&Path>) {}

/// Tauri creates `%LOCALAPPDATA%\<identifier>` on startup even though the installer
/// keeps nothing there (its WebView2 profile is redirected to TEMP). Drop that
/// folder on exit if it is empty, so no stray `eu.akoos.photos.setup` is left.
#[cfg(windows)]
fn remove_stray_data_dir(handle: &tauri::AppHandle) {
    if let Ok(dir) = handle.path().app_local_data_dir() {
        let empty = std::fs::read_dir(&dir).map(|mut r| r.next().is_none()).unwrap_or(false);
        if empty {
            let _ = std::fs::remove_dir(&dir);
        }
    }
}

fn self_install_dir() -> Result<PathBuf, String> {
    let exe = std::env::current_exe().map_err(|e| e.to_string())?;
    exe.parent()
        .map(|p| p.to_path_buf())
        .ok_or_else(|| "no parent dir".to_string())
}

/// Uninstall the copy this exe lives in (the installed `uninstall.exe`).
#[tauri::command]
fn uninstall() -> Result<(), String> {
    uninstall_impl(&self_install_dir()?)
}

/// Uninstall an existing install located via the registry — used when the
/// INSTALLER is launched while the app is already installed.
#[tauri::command]
fn uninstall_existing() -> Result<(), String> {
    let loc = read_install_location().ok_or_else(|| "no existing installation found".to_string())?;
    uninstall_impl(Path::new(&loc))
}

/// Delete everything inside the install folder EXCEPT the running uninstaller's own
/// exe (a process cannot delete its own image while running). Retries briefly for
/// files a just-killed process is still releasing. This removes the bulk — app.exe,
/// the sidecar, and all the encrypted data/thumbnails — synchronously, so removing
/// the user's data never depends on the detached post-exit cleanup succeeding.
fn delete_contents_except_self(install: &Path) {
    let self_name = std::env::current_exe().ok().and_then(|p| p.file_name().map(|n| n.to_owned()));
    for _ in 0..12 {
        let Ok(entries) = fs::read_dir(install) else {
            return; // folder already gone
        };
        let mut remaining = 0;
        for entry in entries.flatten() {
            if Some(entry.file_name()) == self_name {
                continue; // our own running image
            }
            let path = entry.path();
            let removed = if path.is_dir() {
                fs::remove_dir_all(&path)
            } else {
                fs::remove_file(&path)
            };
            if removed.is_err() {
                remaining += 1;
            }
        }
        if remaining == 0 {
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(300));
    }
}

/// Move the running uninstaller's own exe out of the install folder to TEMP, so the
/// folder can then be removed while we keep running. Windows permits renaming a
/// running executable on the same volume. Returns the new path, or None if our exe
/// is not in this folder (the "installer launched from Downloads" uninstall path).
fn move_self_out(install: &Path) -> Option<PathBuf> {
    let exe = std::env::current_exe().ok()?;
    let parent = exe.parent()?;
    // Compare canonicalised, so path-form differences (verbatim prefix) don't matter.
    let in_folder = match (fs::canonicalize(parent), fs::canonicalize(install)) {
        (Ok(a), Ok(b)) => a == b,
        _ => false,
    };
    if !in_folder {
        return None;
    }
    let dest = std::env::temp_dir().join(format!("pfp-uninstall-old-{}.exe", std::process::id()));
    fs::rename(&exe, &dest).ok().map(|_| dest)
}

fn uninstall_impl(install: &Path) -> Result<(), String> {
    // Close the running app first (its WebView2 children hold files in the folder),
    // then give the OS a moment to release those handles.
    kill_under_dir(install);
    std::thread::sleep(std::time::Duration::from_millis(600));
    // Shortcuts.
    let _ = fs::remove_file(desktop_dir().join(format!("{APP_NAME}.lnk")));
    let _ = fs::remove_file(start_menu_dir().join(format!("{APP_NAME}.lnk")));
    // Add/Remove Programs entry.
    remove_uninstall_entry();
    // The Explorer "Proton Photos" nav-pane registration (the folder + the user's
    // downloaded files are kept, as OneDrive does on uninstall).
    remove_sync_root_registration();
    // Legacy data location (pre one-folder builds).
    let _ = fs::remove_dir_all(data_dir());
    // Remove the bulk NOW, synchronously: app.exe, the sidecar, and all the
    // encrypted data/thumbnails go immediately, so it never depends on the detached
    // cleanup. Then move our own running exe out of the folder (Windows allows
    // renaming a running exe on the same volume) and drop the now-empty folder, so
    // the whole folder is gone synchronously rather than via a fragile post-exit step.
    delete_contents_except_self(install);
    let moved = move_self_out(install);
    let _ = fs::remove_dir(install);
    // Best-effort: delete the moved exe once we exit, and retry the folder only if a
    // locked straggler kept it. Low stakes now — the data is already gone.
    spawn_detached_cleanup(install, moved.as_deref());
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Keep the installer's own WebView2 profile out of %LOCALAPPDATA% so it does
    // not leave an `eu.akoos.photos.setup` folder behind; the installer is
    // short-lived, so a temp folder is fine.
    #[cfg(windows)]
    {
        let webview = std::env::temp_dir().join("pfp-setup-webview");
        let _ = std::fs::create_dir_all(&webview);
        std::env::set_var("WEBVIEW2_USER_DATA_FOLDER", &webview);
    }

    // Headless mode for scripted installs / uninstalls (and automated testing):
    //   setup.exe --silent            install to the default location + shortcuts
    //   uninstall.exe --uninstall --silent   remove everything, no prompt
    let args: Vec<String> = std::env::args().collect();
    if args.iter().any(|a| a == "--update") {
        if let Err(e) = update_impl() {
            eprintln!("update error: {e}");
            std::process::exit(1);
        }
        return;
    }
    if args.iter().any(|a| a == "--silent") {
        let result = if is_uninstall() {
            self_install_dir().and_then(|d| uninstall_impl(&d))
        } else {
            install_impl(default_dir_impl(), true, true, true)
        };
        if let Err(e) = result {
            eprintln!("setup error: {e}");
            std::process::exit(1);
        }
        return;
    }

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Safety net: the window starts hidden and the frontend reveals it
            // once painted. If that never happens (a load failure), show it anyway
            // after a moment so the installer is never invisible.
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(4));
                if let Some(w) = handle.get_webview_window("main") {
                    let _ = w.show();
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            mode,
            default_dir,
            install,
            launch,
            uninstall,
            uninstall_existing,
            existing_install,
            show_window
        ])
        .build(tauri::generate_context!())
        .expect("error while running the installer");

    app.run(|_handle, event| {
        // Clean up the empty identifier folder Tauri leaves in %LOCALAPPDATA% once
        // the installer exits, so nothing is scattered outside the install folder.
        if let tauri::RunEvent::Exit = event {
            #[cfg(windows)]
            remove_stray_data_dir(_handle);
        }
    });
}
