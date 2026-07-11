# Photos for Proton for Windows

An unofficial desktop client for **Proton Drive Photos** on Windows. Browse, search, and back up an end-to-end encrypted Proton photo library from a native desktop app.

> **Alpha.** This is an early alpha for people who want to try it and share feedback. Expect rough edges.

## What it does

- Browse your full Proton photo timeline, grouped by month and year, with a fast scrollbar.
- Open any photo in a large preview with zoom and pan, play videos, and view details.
- Search by name and filter by category or media type.
- Albums, plus items shared by you and shared with you.
- Upload photos and videos, and download originals to a folder you choose.
- Rename photos and move them to trash.
- Runs in the system tray, with an app lock, seven color themes, and English or Hungarian.

## Privacy

- End-to-end encrypted throughout: it uses Proton's official Drive SDK, so photos and metadata are decrypted only on this device.
- The stored session and caches are sealed at rest with a key derived from the Proton password (scrypt, then AES-256-GCM); a cold start asks for the password.
- No telemetry.
- Per-user install: everything lives in one folder under `%LOCALAPPDATA%\Photos for Proton\`. Nothing is written to Program Files, ProgramData, or the machine-wide registry.

## Install

Download `Photos-for-Proton-Setup.exe` and run it. This build is not code-signed yet, so Windows SmartScreen shows a warning on first launch: choose **More info**, then **Run anyway**. To remove it later, use Settings, then Apps, or the uninstaller inside the install folder.

## Build from source

Requires Node and a Rust toolchain.

```powershell
cd app;     npm install
cd ../setup;   npm install
cd ../sidecar; npm install
# build the app and package the installer:
./build-setup.ps1
```

Run the tests: `npm test` in `sidecar/`, and `cargo test --lib` in `app/src-tauri` and `setup/src-tauri`.

## How it is built

Tauri (Rust) with a React frontend, plus a Node sidecar that hosts Proton's official Drive TypeScript SDK. The installer in `setup/` is a second small Tauri app that carries the whole app as an embedded payload.

## Not affiliated with Proton

This is an independent project, not affiliated with, endorsed by, or supported by Proton AG. "Proton" and "Proton Drive" are trademarks of Proton AG.

## License

GPL-3.0. See [LICENSE](LICENSE).
