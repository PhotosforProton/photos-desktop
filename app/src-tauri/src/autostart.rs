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

//! Starting with Windows, as one HKCU Run entry.
//!
//! The Run key rather than a Startup-folder shortcut or a scheduled task: it is the
//! one of the three that needs no elevation, no file left in a folder the user browses,
//! and no separate object to keep in step with the install. Per user (HKCU), because
//! the whole app is per user, and a machine-wide entry would start it for accounts that
//! never installed it.
//!
//! The entry launches with `--background`, which is the only reason this is worth
//! having: a login that opened the window every time would be a worse deal than not
//! starting at all. Uninstalling takes the entry with it, which is why the removal half
//! is `pub` and compiled into the installer too. A Run entry outliving its exe is a
//! login-time error dialog for something the user believes they removed.

#[cfg(windows)]
const RUN_KEY: &str = "Software\\Microsoft\\Windows\\CurrentVersion\\Run";

/// Matches the app's display name, so the entry is recognisable in Task Manager's
/// startup list rather than reading as something the user did not install.
#[cfg(windows)]
pub const RUN_VALUE: &str = "Photos for Proton";

/// The flag the Run entry passes, and the one the app looks for to stay in the tray.
pub const BACKGROUND_FLAG: &str = "--background";

/// The command line a Run entry should hold for `exe`.
///
/// Quoted whether or not the path needs it: the default install folder does not
/// contain a space, but a user-chosen one can, and an unquoted path with a space is
/// read by Windows as a different program with arguments.
#[cfg(windows)]
pub fn run_command(exe: &std::path::Path) -> String {
    format!("\"{}\" {}", exe.display(), BACKGROUND_FLAG)
}

/// Whether the app is set to start with Windows.
#[cfg(windows)]
pub fn enabled() -> bool {
    winreg::RegKey::predef(winreg::enums::HKEY_CURRENT_USER)
        .open_subkey(RUN_KEY)
        .and_then(|k| k.get_value::<String, _>(RUN_VALUE))
        .map(|v| !v.trim().is_empty())
        .unwrap_or(false)
}
#[cfg(not(windows))]
pub fn enabled() -> bool {
    false
}

/// Write or remove the entry. Always writes the running exe's own path, so a
/// reinstall into a different folder corrects itself the next time this is touched.
#[cfg(windows)]
pub fn set(on: bool) -> Result<(), String> {
    let key = winreg::RegKey::predef(winreg::enums::HKEY_CURRENT_USER)
        .create_subkey(RUN_KEY)
        .map_err(|e| e.to_string())?
        .0;
    if !on {
        // Absent already is the state being asked for, not a failure.
        return match key.delete_value(RUN_VALUE) {
            Ok(()) => Ok(()),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
            Err(e) => Err(e.to_string()),
        };
    }
    let exe = std::env::current_exe().map_err(|e| e.to_string())?;
    key.set_value(RUN_VALUE, &run_command(&exe))
        .map_err(|e| e.to_string())
}
#[cfg(not(windows))]
pub fn set(on: bool) -> Result<(), String> {
    let _ = on;
    Ok(())
}

/// Point an existing entry at `exe` if it names anything else.
///
/// Only ever corrects an entry that is already there: an install whose executable
/// moved or was renamed must keep starting with Windows, but one that was never asked
/// to start must not begin to. The installer calls this during an upgrade, where the
/// running process is the installer and so cannot ask itself where the app now lives.
#[cfg(windows)]
pub fn repoint(exe: &std::path::Path) {
    if !enabled() {
        return;
    }
    let want = run_command(exe);
    let key = winreg::RegKey::predef(winreg::enums::HKEY_CURRENT_USER).open_subkey_with_flags(
        RUN_KEY,
        winreg::enums::KEY_READ | winreg::enums::KEY_WRITE,
    );
    if let Ok(key) = key {
        let have: String = key.get_value(RUN_VALUE).unwrap_or_default();
        if have != want {
            let _ = key.set_value(RUN_VALUE, &want);
        }
    }
}

/// The same correction, for the app itself, which does know where it is.
#[cfg(windows)]
pub fn refresh() {
    if let Ok(exe) = std::env::current_exe() {
        repoint(&exe);
    }
}

/// Take the entry away. Called by the uninstaller, where there is no app left to run.
#[cfg(windows)]
pub fn remove() {
    if let Ok(key) = winreg::RegKey::predef(winreg::enums::HKEY_CURRENT_USER)
        .open_subkey_with_flags(RUN_KEY, winreg::enums::KEY_WRITE)
    {
        let _ = key.delete_value(RUN_VALUE);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The quoting is the whole point of building the string in one place: a path with
    /// a space in it is the case that silently starts the wrong thing.
    #[test]
    #[cfg(windows)]
    fn run_command_quotes_the_path() {
        let cmd = run_command(std::path::Path::new("C:\\Program Files\\PfP\\photosforproton.exe"));
        assert_eq!(cmd, "\"C:\\Program Files\\PfP\\photosforproton.exe\" --background");
        assert!(cmd.starts_with('"'));
        assert!(cmd.ends_with(BACKGROUND_FLAG));
    }

    /// The flag the entry writes and the flag the app tests for are the same constant,
    /// so a rename cannot leave the two ends disagreeing silently.
    #[test]
    fn background_flag_is_a_flag() {
        assert!(BACKGROUND_FLAG.starts_with("--"));
        assert!(!BACKGROUND_FLAG.contains(' '));
    }
}
