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

// Encrypted, app-owned storage for non-secret preferences.
//
// Every byte lives inside the app's own directory. A random AES-256-GCM data
// key is generated on first use and sealed at rest with user-scope DPAPI, so
// only the same Windows user on the same machine can unseal it, and nothing is
// registered anywhere the system can enumerate.
//
// This key backs what must be readable before login: the `settings` blob (theme,
// language, toggles) and the mount's own uid lists. The session and thumbnail cache
// are owned by the sidecar and encrypted with a stronger, password-derived vault key
// instead.

use std::fs;
use std::path::PathBuf;

use aes_gcm::aead::{Aead, AeadCore, KeyInit, OsRng};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use tauri::{AppHandle, Manager};
use windows_dpapi::{decrypt_data, encrypt_data, Scope};

/// Bound into the DPAPI seal so a blob lifted from this app cannot be unsealed
/// by another process running as the same user.
const DPAPI_ENTROPY: &[u8] = b"eu.akoos.photos.desktop/store/v1";
const KEY_FILE: &str = "key.bin";
const NONCE_LEN: usize = 12;

/// Separate entropy and a separate file for the vault-metadata key, so it is not
/// interchangeable with the store key above. That key opens the settings blob and
/// the mount's uid lists; this one is handed to the sidecar, and a single key doing
/// both jobs would widen what a leak on either side costs.
const VAULT_KEY_ENTROPY: &[u8] = b"eu.akoos.photos.desktop/vaultmeta/v1";
const VAULT_KEY_FILE: &str = "vaultmeta.bin";

/// The installer lays the app out as the app's exe + `<install>\resources\`
/// (the runtime) + a runtime `<install>\data\`. When that layout is present
/// (the runtime sits under `resources\` next to us), keep ALL data in
/// `<install>\data` so everything lives in ONE install folder and the uninstaller
/// wipes it together. Returns None in dev / any other layout, where the OS
/// app-data dir is used instead.
pub fn install_data_dir() -> Option<PathBuf> {
    let exe = std::env::current_exe().ok()?;
    let dir = exe.parent()?;
    let runtime = dir
        .join("resources")
        .join(if cfg!(windows) { "sidecar.exe" } else { "sidecar" });
    runtime.exists().then(|| dir.join("data"))
}

pub fn app_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = match install_data_dir() {
        Some(d) => d,
        None => app.path().app_local_data_dir().map_err(|e| e.to_string())?,
    };
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

/// The AES data key, created on first use and sealed with user-scope DPAPI.
fn data_key(app: &AppHandle) -> Result<Key<Aes256Gcm>, String> {
    let path = app_dir(app)?.join(KEY_FILE);
    if path.exists() {
        let sealed = fs::read(&path).map_err(|e| e.to_string())?;
        let raw = decrypt_data(&sealed, Scope::User, Some(DPAPI_ENTROPY))
            .map_err(|e| format!("could not unseal the data key: {e}"))?;
        if raw.len() != 32 {
            return Err("stored data key is corrupt".into());
        }
        return Ok(*Key::<Aes256Gcm>::from_slice(&raw));
    }
    let key = Aes256Gcm::generate_key(&mut OsRng);
    let sealed = encrypt_data(key.as_slice(), Scope::User, Some(DPAPI_ENTROPY))
        .map_err(|e| format!("could not seal the data key: {e}"))?;
    fs::write(&path, sealed).map_err(|e| e.to_string())?;
    Ok(key)
}

fn seal(key: &Key<Aes256Gcm>, plain: &[u8]) -> Result<Vec<u8>, String> {
    let cipher = Aes256Gcm::new(key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let mut out = nonce.to_vec();
    out.extend_from_slice(
        &cipher
            .encrypt(&nonce, plain)
            .map_err(|_| "encryption failed".to_string())?,
    );
    Ok(out)
}

fn unseal(key: &Key<Aes256Gcm>, blob: &[u8]) -> Result<Vec<u8>, String> {
    if blob.len() <= NONCE_LEN {
        return Err("stored blob is truncated".into());
    }
    let (nonce, ciphertext) = blob.split_at(NONCE_LEN);
    Aes256Gcm::new(key)
        .decrypt(Nonce::from_slice(nonce), ciphertext)
        .map_err(|_| "decryption failed".to_string())
}

/// Names come from the WebView, so they must never be able to escape app_dir.
fn safe_name(name: &str) -> Result<String, String> {
    let ok = !name.is_empty()
        && name.len() <= 64
        && name
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'_' || b == b'-');
    if !ok {
        return Err("invalid store name".into());
    }
    Ok(format!("{name}.bin"))
}

/// Seal one text file into the app directory. Named directly, so callers inside the
/// app (the mount's uid lists) can share this key without going through the
/// WebView-facing name check, which exists to constrain what the renderer may name.
pub(crate) fn write_sealed(app: &AppHandle, file: &str, value: &str) -> Result<(), String> {
    let path = app_dir(app)?.join(file);
    let blob = seal(&data_key(app)?, value.as_bytes())?;
    fs::write(path, blob).map_err(|e| e.to_string())
}

/// Read one sealed text file back. A blob that cannot be opened (tampered, or
/// written under a different key) is reported as absent rather than as an error, so
/// every caller falls back to its own empty state instead of failing: the app falls
/// back to sign-in, and the mount to "nothing recorded yet".
pub(crate) fn read_sealed(app: &AppHandle, file: &str) -> Result<Option<String>, String> {
    let path = app_dir(app)?.join(file);
    if !path.exists() {
        return Ok(None);
    }
    let blob = fs::read(path).map_err(|e| e.to_string())?;
    match unseal(&data_key(app)?, &blob) {
        Ok(plain) => Ok(Some(String::from_utf8_lossy(&plain).into_owned())),
        Err(_) => Ok(None),
    }
}

#[tauri::command]
pub fn store_set(app: AppHandle, name: String, value: String) -> Result<(), String> {
    write_sealed(&app, &safe_name(&name)?, &value)
}

#[tauri::command]
pub fn store_get(app: AppHandle, name: String) -> Result<Option<String>, String> {
    read_sealed(&app, &safe_name(&name)?)
}

#[tauri::command]
pub fn store_del(app: AppHandle, name: String) -> Result<(), String> {
    let path = app_dir(&app)?.join(safe_name(&name)?);
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// A random key, sealed at rest with DPAPI, that exists purely so the vault's own
/// metadata does not sit on disk in the clear.
///
/// The vault derives the sidecar's data key from the user's Proton password and a
/// random salt. Left readable, that salt is enough to mount an offline attack on the
/// password itself: guess, derive, compare, with no server to rate-limit it. And the
/// password is the Proton ACCOUNT password, so what is at stake is not the photo
/// cache but Mail, Calendar and account recovery.
///
/// Sealing the salt removes the attack from anyone holding only the files (a stolen
/// laptop, a backup image, a resold drive), because DPAPI will not unseal this key
/// for them. It does not defend against code already running as this Windows user;
/// only breaking the password-to-key binding would, and that would cost the vault's
/// ability to verify a password locally at all.
fn vault_meta_key(app: &AppHandle) -> Result<String, String> {
    let path = app_dir(app)?.join(VAULT_KEY_FILE);
    let raw = if path.exists() {
        let sealed = fs::read(&path).map_err(|e| e.to_string())?;
        decrypt_data(&sealed, Scope::User, Some(VAULT_KEY_ENTROPY))
            .map_err(|e| format!("could not unseal the vault key: {e}"))?
    } else {
        let key = Aes256Gcm::generate_key(&mut OsRng).to_vec();
        let sealed = encrypt_data(&key, Scope::User, Some(VAULT_KEY_ENTROPY))
            .map_err(|e| format!("could not seal the vault key: {e}"))?;
        fs::write(&path, sealed).map_err(|e| e.to_string())?;
        key
    };
    if raw.len() != 32 {
        return Err("stored vault key is corrupt".into());
    }
    // Hex rather than base64: the JSON hop needs some text form, and hex costs no
    // dependency and cannot be confused with the base64 uids elsewhere in the logs.
    Ok(raw.iter().map(|b| format!("{b:02x}")).collect())
}

/// Handed to the sidecar over stdin at spawn: the app directory, and the key that
/// seals the vault's metadata. The sidecar still derives its own AES data key from
/// the user's password, so the caches and the session stay shut until unlock; this
/// key only keeps the salt and verifier that guard that derivation off the disk in
/// readable form.
pub fn sidecar_init_params(app: &AppHandle) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "dataDir": app_dir(app)?.to_string_lossy(),
        "vaultKey": vault_meta_key(app)?,
    }))
}

#[cfg(test)]
mod tests {
    use super::{seal, unseal};
    use aes_gcm::aead::{KeyInit, OsRng};
    use aes_gcm::Aes256Gcm;

    #[test]
    fn seal_unseal_round_trips() {
        let key = Aes256Gcm::generate_key(&mut OsRng);
        let plain = b"session tokens + key passphrases";
        let blob = seal(&key, plain).unwrap();
        assert_eq!(unseal(&key, &blob).unwrap(), plain);
    }

    #[test]
    fn tampered_blob_is_rejected() {
        let key = Aes256Gcm::generate_key(&mut OsRng);
        let mut blob = seal(&key, b"secret").unwrap();
        let n = blob.len();
        blob[n - 1] ^= 0xff; // flip a tag byte
        assert!(unseal(&key, &blob).is_err());
    }

    #[test]
    fn wrong_key_fails_closed() {
        let a = Aes256Gcm::generate_key(&mut OsRng);
        let b = Aes256Gcm::generate_key(&mut OsRng);
        let blob = seal(&a, b"data").unwrap();
        assert!(unseal(&b, &blob).is_err());
    }

    #[test]
    fn truncated_blob_is_rejected() {
        let key = Aes256Gcm::generate_key(&mut OsRng);
        assert!(unseal(&key, &[0u8; 5]).is_err());
    }
}
