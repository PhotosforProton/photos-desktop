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

// Tauri host: owns the encrypted app store, spawns the Node sidecar (which runs
// the official Proton Drive SDK), and relays newline-delimited JSON-RPC to it,
// one request at a time.

mod secure_store;

use std::io::{BufRead, BufReader, Write};
use std::process::{Child, ChildStdin, ChildStdout, Command, Stdio};
use std::sync::{Arc, Mutex};
use tauri::webview::WebviewBuilder;
use tauri::{AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, State, WebviewUrl};

struct Sidecar {
    _child: Child,
    stdin: ChildStdin,
    reader: BufReader<ChildStdout>,
    next_id: u64,
}

type SharedSidecar = Arc<Mutex<Option<Sidecar>>>;

fn sidecar_dir() -> std::path::PathBuf {
    std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../sidecar")
}

/// Windows APIs hand back verbatim paths (`\\?\C:\...`). Rust opens them fine,
/// but Node cannot: its main-module resolver walks such a path down to a bare
/// `C:` and dies with `EISDIR`. Strip the prefix before handing a path over.
fn strip_verbatim(path: std::path::PathBuf) -> std::path::PathBuf {
    match path.to_str().and_then(|s| s.strip_prefix(r"\\?\")) {
        Some(rest) => std::path::PathBuf::from(rest),
        None => path,
    }
}

/// In a packaged build the sidecar ships as two pieces: a Node runtime copied
/// next to the app executable as `sidecar.exe`, and the bundled script beside it
/// under `sidecar/`, with sharp's native addon in `sidecar/node_modules`.
fn packaged_command(app: &AppHandle) -> Result<Command, String> {
    let result = locate_packaged_sidecar(app);
    if let Err(message) = &result {
        // A packaged build has no console and the frontend swallows this error,
        // so leave a trace on disk or a failure is invisible.
        note(app, message);
    }
    let (runtime, script) = result?;

    let mut command = Command::new(runtime);
    command.arg(script);
    // Tell the sidecar this is the packaged build, so it keeps library console
    // output out of the on-disk log (only our own scrubbed lines are persisted).
    command.env("SIDECAR_RELEASE", "1");
    Ok(command)
}

fn locate_packaged_sidecar(app: &AppHandle) -> Result<(std::path::PathBuf, std::path::PathBuf), String> {
    let exe_dir = strip_verbatim(
        std::env::current_exe()
            .map_err(|e| format!("cannot locate the app executable: {e}"))?
            .parent()
            .ok_or("the app executable has no parent directory")?
            .to_path_buf(),
    );

    // The installer keeps the runtime under a `resources\` subfolder so the
    // install folder's top level stays tidy: <install>\resources\sidecar.exe and
    // <install>\resources\sidecar\server.mjs.
    let res = exe_dir.join("resources");
    let runtime = res.join(if cfg!(windows) { "sidecar.exe" } else { "sidecar" });

    let beside = res.join("sidecar").join("server.mjs");
    let script = if beside.exists() {
        beside
    } else {
        strip_verbatim(
            app.path()
                .resource_dir()
                .map_err(|e| format!("cannot locate app resources: {e}"))?
                .join("sidecar")
                .join("server.mjs"),
        )
    };

    if !runtime.exists() || !script.exists() {
        return Err(format!(
            "sidecar missing: runtime {} (exists: {}), script {} (exists: {})",
            runtime.display(),
            runtime.exists(),
            script.display(),
            script.exists()
        ));
    }
    Ok((runtime, script))
}

/// Append a host-side line to the same log the sidecar's stderr goes to.
fn note(app: &AppHandle, message: &str) {
    let Ok(dir) = secure_store::app_dir(app) else { return };
    if let Ok(mut file) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(dir.join("sidecar.log"))
    {
        let _ = writeln!(file, "[host] {message}");
    }
}

/// Dev runs the TypeScript straight from the source tree, so editing the sidecar
/// needs no rebuild. The packaged bundle aliases `openpgp/lightweight` to
/// openpgp's Node build, but tsx resolves the real subpath, which only exports a
/// `browser` condition, hence the extra flag here and not in the shipped app.
fn dev_command() -> Command {
    let mut command = Command::new("cmd");
    command
        .args(["/C", "npx", "tsx", "server.ts"])
        .env("NODE_OPTIONS", "--conditions=browser")
        .current_dir(sidecar_dir());
    command
}

/// A packaged build has no console, so the sidecar's stderr would be discarded.
/// Send it to a file in the app directory instead: without it, a failure on a
/// user's machine leaves nothing to look at.
fn sidecar_log(app: &AppHandle) -> Stdio {
    let Ok(dir) = secure_store::app_dir(app) else {
        return Stdio::null();
    };
    std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(dir.join("sidecar.log"))
        .map(Stdio::from)
        .unwrap_or_else(|_| Stdio::null())
}

fn spawn_sidecar(app: &AppHandle) -> Result<Sidecar, String> {
    let mut command = if cfg!(debug_assertions) {
        dev_command()
    } else {
        packaged_command(app)?
    };

    let stderr = if cfg!(debug_assertions) {
        Stdio::inherit()
    } else {
        sidecar_log(app)
    };

    // The Node runtime is a console-subsystem executable, so Windows would pop a
    // console window every time it is spawned. Suppress it in the packaged app;
    // dev keeps the console so the sidecar's inherited stderr stays visible.
    #[cfg(windows)]
    if !cfg!(debug_assertions) {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        command.creation_flags(CREATE_NO_WINDOW);
    }

    let mut child = command
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(stderr)
        .spawn()
        .map_err(|e| format!("failed to spawn sidecar: {e}"))?;
    let stdin = child.stdin.take().ok_or("sidecar stdin unavailable")?;
    let stdout = child.stdout.take().ok_or("sidecar stdout unavailable")?;
    let mut sc = Sidecar {
        _child: child,
        stdin,
        reader: BufReader::new(stdout),
        next_id: 1,
    };

    // Hand over the app directory before anything else, so the sidecar knows
    // where to keep its (vault-encrypted) caches and session. Stdin only.
    let init = secure_store::sidecar_init_params(app)?;
    do_io(&mut sc, "__init".to_string(), init)?;
    Ok(sc)
}

fn do_io(
    sc: &mut Sidecar,
    method: String,
    params: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let id = sc.next_id;
    sc.next_id += 1;
    let req = serde_json::json!({ "id": id, "method": method, "params": params });
    let mut line = serde_json::to_string(&req).map_err(|e| e.to_string())?;
    line.push('\n');
    sc.stdin
        .write_all(line.as_bytes())
        .map_err(|e| format!("write to sidecar failed: {e}"))?;
    sc.stdin
        .flush()
        .map_err(|e| format!("flush to sidecar failed: {e}"))?;

    // Requests are serialized; skip any stray non-JSON stdout (SDK/openpgp logs)
    // until we reach our JSON-RPC response line.
    loop {
        let mut resp_line = String::new();
        let n = sc
            .reader
            .read_line(&mut resp_line)
            .map_err(|e| format!("read from sidecar failed: {e}"))?;
        if n == 0 {
            return Err("sidecar closed unexpectedly".to_string());
        }
        let trimmed = resp_line.trim();
        if trimmed.is_empty() {
            continue;
        }
        if let Ok(v) = serde_json::from_str::<serde_json::Value>(trimmed) {
            return Ok(v);
        }
        // Not JSON, a stray log line; keep reading for the real response.
    }
}

fn rpc_blocking(
    app: &AppHandle,
    shared: &SharedSidecar,
    method: String,
    params: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let mut guard = shared
        .lock()
        .map_err(|_| "sidecar lock poisoned".to_string())?;
    if guard.is_none() {
        *guard = Some(spawn_sidecar(app)?);
    }
    let result = do_io(guard.as_mut().unwrap(), method, params);
    if result.is_err() {
        // Drop the (possibly dead) sidecar so the next call spawns a fresh one.
        *guard = None;
    }
    result
}

#[tauri::command]
async fn rpc(
    app: AppHandle,
    state: State<'_, SharedSidecar>,
    method: String,
    params: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let shared = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || rpc_blocking(&app, &shared, method, params))
        .await
        .map_err(|e| format!("sidecar task failed: {e}"))?
}

// ---- Human verification (captcha) ----
//
// Proton's captcha page refuses to be iframed: its `frame-ancestors` names only
// Proton's own web origins. That is why the official Android client hosts it in
// a native WebView. We do the same, but as a child webview placed inside the
// main window, so it is a top-level document and no extra OS window appears.
//
// The page reports its result with `window.parent.postMessage(...)`. In a
// top-level webview that posts to itself, so the bridge below catches the event
// and hands it to Rust via a sentinel navigation we cancel. Tauri's IPC is never
// exposed to the remote page.

const CAPTCHA_LABEL: &str = "captcha";
const CAPTCHA_ORIGIN: &str = "https://drive-api.proton.me";
const CAPTCHA_SENTINEL_HOST: &str = "captcha.result";

const CAPTCHA_BRIDGE: &str = r#"
(function () {
  // Blend the page into our card: our background, centred, no scrollbar.
  function applyStyle() {
    var style = document.createElement('style');
    style.textContent =
      'html,body{background:#0e0e0f !important;margin:0 !important;}' +
      'body{display:grid;place-items:center;min-height:100vh;}' +
      '::-webkit-scrollbar{width:0 !important;height:0 !important;}';
    (document.head || document.documentElement).appendChild(style);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyStyle);
  } else {
    applyStyle();
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== 'https://drive-api.proton.me') return;
    var data = event.data;
    if (!data || (data.type !== 'pm_captcha' && data.type !== 'pm_captcha_expired')) return;
    var url = new URL('https://captcha.result/');
    url.searchParams.set('type', data.type);
    url.searchParams.set('token', data.token || '');
    window.location.href = url.toString();
  });
})();
"#;

/// Must stay `async`. Tauri runs synchronous commands on the main thread, while
/// `add_child` posts webview creation to that same thread and waits for it, so a
/// sync version deadlocks before the webview is ever created.
#[tauri::command]
async fn open_captcha(
    app: AppHandle,
    url: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    // Exact-origin check (not just a prefix): a look-alike host such as
    // drive-api.proton.me.evil.test must not pass.
    let parsed = tauri::Url::parse(&url).map_err(|e| e.to_string())?;
    if !url.starts_with(CAPTCHA_ORIGIN)
        || parsed.scheme() != "https"
        || parsed.host_str() != Some("drive-api.proton.me")
    {
        return Err("refusing to open a page outside the Proton captcha origin".into());
    }
    let window = app.get_window("main").ok_or("no main window")?;
    if let Some(existing) = app.get_webview(CAPTCHA_LABEL) {
        let _ = existing.close();
    }
    let handle = app.clone();
    let builder = WebviewBuilder::new(CAPTCHA_LABEL, WebviewUrl::External(parsed))
        .initialization_script(CAPTCHA_BRIDGE)
        .on_navigation(move |target| {
            if target.host_str() != Some(CAPTCHA_SENTINEL_HOST) {
                return true;
            }
            let mut kind = String::new();
            let mut token = String::new();
            for (key, value) in target.query_pairs() {
                match key.as_ref() {
                    "type" => kind = value.into_owned(),
                    "token" => token = value.into_owned(),
                    _ => {}
                }
            }
            let _ = handle.emit("captcha", serde_json::json!({ "type": kind, "token": token }));
            false // the sentinel is a signal, never a real navigation
        });

    window
        .add_child(
            builder,
            LogicalPosition::new(x, y),
            LogicalSize::new(width, height),
        )
        .map_err(|e| {
            eprintln!("[host] captcha webview creation failed: {e}");
            e.to_string()
        })?;
    Ok(())
}

/// Keep the child webview glued to its placeholder as the window resizes or scrolls.
#[tauri::command]
async fn move_captcha(app: AppHandle, x: f64, y: f64, width: f64, height: f64) -> Result<(), String> {
    if let Some(webview) = app.get_webview(CAPTCHA_LABEL) {
        webview
            .set_position(LogicalPosition::new(x, y))
            .map_err(|e| e.to_string())?;
        webview
            .set_size(LogicalSize::new(width, height))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Async for the same reason as `open_captcha`: closing dispatches to the main thread.
#[tauri::command]
async fn close_captcha(app: AppHandle) -> Result<(), String> {
    if let Some(webview) = app.get_webview(CAPTCHA_LABEL) {
        webview.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Reliable click-outside dismissal for the tray popup.
///
/// Focus-based dismissal is unreliable on Windows: the foreground lock keeps the
/// popup from taking focus on show, so no blur ever fires and the first outside
/// click is ignored. Instead, while the popup is open we install a low-level
/// mouse hook and hide it on the first button-down whose point is outside the
/// popup's rectangle. No focus required.
#[cfg(windows)]
mod tray_dismiss {
    use std::ffi::c_void;
    use std::sync::atomic::{AtomicIsize, Ordering};
    use windows::Win32::Foundation::{HWND, LPARAM, LRESULT, RECT, WPARAM};
    use windows::Win32::UI::WindowsAndMessaging::{
        CallNextHookEx, GetWindowRect, SetWindowsHookExW, ShowWindow, UnhookWindowsHookEx, HHOOK,
        MSLLHOOKSTRUCT, SW_HIDE, WH_MOUSE_LL, WM_LBUTTONDOWN, WM_MBUTTONDOWN, WM_RBUTTONDOWN,
    };

    static HOOK: AtomicIsize = AtomicIsize::new(0);
    static POPUP: AtomicIsize = AtomicIsize::new(0);

    unsafe extern "system" fn hook_proc(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
        if code >= 0 {
            let msg = wparam.0 as u32;
            if msg == WM_LBUTTONDOWN || msg == WM_RBUTTONDOWN || msg == WM_MBUTTONDOWN {
                let raw = POPUP.load(Ordering::SeqCst);
                if raw != 0 {
                    let hwnd = HWND(raw as *mut c_void);
                    let info = &*(lparam.0 as *const MSLLHOOKSTRUCT);
                    let mut rect = RECT::default();
                    if GetWindowRect(hwnd, &mut rect).is_ok() {
                        let p = info.pt;
                        let inside =
                            p.x >= rect.left && p.x < rect.right && p.y >= rect.top && p.y < rect.bottom;
                        if !inside {
                            let _ = ShowWindow(hwnd, SW_HIDE);
                            uninstall();
                        }
                    }
                }
            }
        }
        CallNextHookEx(None, code, wparam, lparam)
    }

    pub fn install(popup: HWND) {
        POPUP.store(popup.0 as isize, Ordering::SeqCst);
        if HOOK.load(Ordering::SeqCst) != 0 {
            return; // already armed
        }
        unsafe {
            if let Ok(h) = SetWindowsHookExW(WH_MOUSE_LL, Some(hook_proc), None, 0) {
                HOOK.store(h.0 as isize, Ordering::SeqCst);
            }
        }
    }

    pub fn uninstall() {
        let raw = HOOK.swap(0, Ordering::SeqCst);
        if raw != 0 {
            unsafe {
                let _ = UnhookWindowsHookEx(HHOOK(raw as *mut c_void));
            }
        }
    }
}

/// Bring the main window back from the tray.
fn show_main_window(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.show();
        let _ = w.unminimize();
        let _ = w.set_focus();
    }
}

/// System-tray icon so the app keeps running in the background once its window
/// is closed. Left-click reopens the main window; right-click shows our own
/// rounded popup (a real frameless window, not the OS menu) near the cursor.
fn build_tray(app: &AppHandle) -> tauri::Result<()> {
    use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};

    let Some(icon) = app.default_window_icon().cloned() else {
        return Ok(());
    };

    TrayIconBuilder::with_id("main")
        .icon(icon)
        .tooltip("Photos for Proton")
        .on_tray_icon_event(|tray, event| {
            let app = tray.app_handle();
            match event {
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } => show_main_window(app),
                TrayIconEvent::Click {
                    button: MouseButton::Right,
                    button_state: MouseButtonState::Up,
                    ..
                } => show_tray_popup(app),
                _ => {}
            }
        })
        .build(app)?;
    Ok(())
}

/// A frameless, transparent popup styled like the app (rounded corners). It
/// loads the frontend, which renders the tray menu when it sees this window's
/// label ("tray_popup"). Created hidden at startup; shown on tray right-click.
fn build_tray_popup(app: &AppHandle) -> tauri::Result<()> {
    let popup =
        tauri::WebviewWindowBuilder::new(app, "tray_popup", tauri::WebviewUrl::default())
            .title("")
            .inner_size(288.0, 336.0)
            .decorations(false)
            .transparent(true)
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .visible(false)
            .build()?;

    // Dismiss on click-outside.
    let handle = app.clone();
    popup.on_window_event(move |event| {
        if let tauri::WindowEvent::Focused(false) = event {
            if let Some(w) = handle.get_webview_window("tray_popup") {
                let _ = w.hide();
            }
        }
    });
    Ok(())
}

/// Force the popup to the foreground. Windows blocks `SetForegroundWindow` when the
/// calling app is not the active one (so `set_focus` alone leaves the popup shown
/// but unfocused, and the first click outside would not dismiss it). Briefly
/// attaching our input thread to the current foreground thread lifts that
/// restriction, then we can steal focus.
#[cfg(windows)]
fn force_foreground(window: &tauri::WebviewWindow) {
    use windows::Win32::System::Threading::{AttachThreadInput, GetCurrentThreadId};
    use windows::Win32::UI::Input::KeyboardAndMouse::SetFocus;
    use windows::Win32::UI::WindowsAndMessaging::{
        GetForegroundWindow, GetWindowThreadProcessId, SetForegroundWindow,
    };
    let Ok(hwnd) = window.hwnd() else {
        return;
    };
    unsafe {
        let fg_thread = GetWindowThreadProcessId(GetForegroundWindow(), None);
        let our_thread = GetCurrentThreadId();
        let attached = fg_thread != 0 && fg_thread != our_thread;
        if attached {
            let _ = AttachThreadInput(our_thread, fg_thread, true);
        }
        let _ = SetForegroundWindow(hwnd);
        let _ = SetFocus(Some(hwnd));
        if attached {
            let _ = AttachThreadInput(our_thread, fg_thread, false);
        }
    }
}

#[cfg(not(windows))]
fn force_foreground(window: &tauri::WebviewWindow) {
    let _ = window.set_focus();
}

/// Natively show the window. The dismiss hook hides it with `ShowWindow(SW_HIDE)`,
/// which bypasses Tauri, so Tauri still believes the window is visible and its own
/// `show()` becomes a no-op on the next open. A native `SW_SHOW` re-shows it
/// regardless of that stale state.
#[cfg(windows)]
fn native_show(window: &tauri::WebviewWindow) {
    use windows::Win32::UI::WindowsAndMessaging::{ShowWindow, SW_SHOW};
    if let Ok(hwnd) = window.hwnd() {
        unsafe {
            let _ = ShowWindow(hwnd, SW_SHOW);
        }
    }
}

#[cfg(not(windows))]
fn native_show(_window: &tauri::WebviewWindow) {}

/// Anchor the popup bottom-right, above the taskbar, like a standard tray flyout,
/// then tell it to refresh its account data (it was created before sign-in).
fn show_tray_popup(app: &AppHandle) {
    let Some(w) = app.get_webview_window("tray_popup") else {
        return;
    };
    let size = w.outer_size().unwrap_or(tauri::PhysicalSize::new(288, 336));
    if let Ok(Some(monitor)) = w.primary_monitor() {
        let ms = monitor.size();
        let taskbar = (48.0 * monitor.scale_factor()) as i32;
        let margin = (10.0 * monitor.scale_factor()) as i32;
        let x = (ms.width as i32 - size.width as i32 - margin).max(margin);
        let y = (ms.height as i32 - size.height as i32 - taskbar - margin).max(margin);
        let _ = w.set_position(tauri::PhysicalPosition::new(x, y));
    }
    let _ = w.show();
    native_show(&w);
    force_foreground(&w);
    #[cfg(windows)]
    if let Ok(hwnd) = w.hwnd() {
        tray_dismiss::install(hwnd);
    }
    let _ = w.emit("tray-shown", ());
}

#[tauri::command]
fn quit_app(app: AppHandle) {
    app.exit(0);
}

#[tauri::command]
fn hide_tray_popup(app: AppHandle) {
    #[cfg(windows)]
    tray_dismiss::uninstall();
    if let Some(w) = app.get_webview_window("tray_popup") {
        let _ = w.hide();
    }
}

#[tauri::command]
fn open_main_from_tray(app: AppHandle) {
    #[cfg(windows)]
    tray_dismiss::uninstall();
    if let Some(w) = app.get_webview_window("tray_popup") {
        let _ = w.hide();
    }
    show_main_window(&app);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Keep the WebView2 profile inside the app's own data folder so, on an
    // installed build, everything (session, caches, WebView data) lives under the
    // single install folder and the uninstaller wipes it all together.
    #[cfg(windows)]
    if let Some(data) = secure_store::install_data_dir() {
        let webview = data.join("EBWebView");
        let _ = std::fs::create_dir_all(&webview);
        std::env::set_var("WEBVIEW2_USER_DATA_FOLDER", &webview);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            // A second launch just focuses the already-running window.
            show_main_window(app);
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(SharedSidecar::default())
        .invoke_handler(tauri::generate_handler![
            rpc,
            open_captcha,
            move_captcha,
            close_captcha,
            quit_app,
            hide_tray_popup,
            open_main_from_tray,
            secure_store::store_set,
            secure_store::store_get,
            secure_store::store_del
        ])
        .setup(|app| {
            // Tauri touches the OS app-data dir on init even though, on an
            // installed build, we keep everything in the install folder. A moment
            // after startup, drop that stray dir if it is empty, so nothing is
            // scattered outside the one install folder.
            #[cfg(windows)]
            if secure_store::install_data_dir().is_some() {
                if let Ok(d) = app.path().app_local_data_dir() {
                    std::thread::spawn(move || {
                        std::thread::sleep(std::time::Duration::from_secs(6));
                        let empty = std::fs::read_dir(&d)
                            .map(|mut r| r.next().is_none())
                            .unwrap_or(false);
                        if empty {
                            let _ = std::fs::remove_dir(&d);
                        }
                    });
                }
            }
            // The main window ships hidden (visible:false) and the frontend reveals
            // it once painted, so no empty transparent frame flashes on startup.
            // Pin its icon to the app icon explicitly (a stale Windows icon cache
            // could otherwise leave the old taskbar icon), and, as a safety net,
            // show it anyway if the frontend never got the chance to.
            if let Some(main) = app.get_webview_window("main") {
                if let Some(icon) = app.default_window_icon().cloned() {
                    let _ = main.set_icon(icon);
                }
                let fallback = main.clone();
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_secs(5));
                    if !fallback.is_visible().unwrap_or(false) {
                        let _ = fallback.show();
                    }
                });
            }
            build_tray(app.handle())?;
            build_tray_popup(app.handle())?;
            Ok(())
        })
        .on_window_event(|window, event| {
            // Close to tray: hide instead of quitting so the app keeps running
            // in the background. Quitting for real is the tray's "Quit" item.
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
                let _ = window.app_handle().emit("window-hidden", ());
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
