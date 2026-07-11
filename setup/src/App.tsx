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

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import logo from "./assets/logo.png";

const VERSION = "0.1.0";
const APP_NAME = "Photos for Proton";

type Mode = "install" | "uninstall";
type Step = "welcome" | "options" | "working" | "done" | "error";

export default function App() {
  const [mode, setMode] = useState<Mode>("install");
  const [step, setStep] = useState<Step>("welcome");
  const [dir, setDir] = useState("");
  const [desktop, setDesktop] = useState(true);
  const [startMenu, setStartMenu] = useState(true);
  const [error, setError] = useState("");
  const [existing, setExisting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const m = await invoke<Mode>("mode").catch(() => "install" as Mode);
      setMode(m);
      if (m === "install") {
        setDir(await invoke<string>("default_dir").catch(() => "C:\\Users\\...\\Photos for Proton"));
        setExisting(await invoke<string | null>("existing_install").catch(() => null));
      }
      // The window starts hidden; reveal it now that the right screen is ready
      // (avoids a flash of the empty transparent frame while the WebView loads).
      requestAnimationFrame(() => void invoke("show_window").catch(() => {}));
    })();
  }, []);

  // Disable the WebView's native right-click menu (this is an installer, not a page).
  useEffect(() => {
    const block = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  const close = () => getCurrentWindow().close().catch(() => {});

  // After a successful uninstall, close automatically: the detached folder cleanup
  // waits for this window to exit before it can remove the install directory.
  useEffect(() => {
    if (mode === "uninstall" && step === "done") {
      const t = setTimeout(() => close(), 1800);
      return () => clearTimeout(t);
    }
  }, [mode, step]);

  async function doInstall() {
    setStep("working");
    try {
      await invoke("install", { dir, desktop, startMenu });
      setStep("done");
    } catch (e) {
      setError(String(e));
      setStep("error");
    }
  }

  async function doUninstall() {
    setStep("working");
    try {
      await invoke("uninstall");
      setStep("done");
    } catch (e) {
      setError(String(e));
      setStep("error");
    }
  }

  // Launched as the installer, but the app is already installed: remove it.
  async function doUninstallExisting() {
    setMode("uninstall");
    setStep("working");
    try {
      await invoke("uninstall_existing");
      setStep("done");
    } catch (e) {
      setError(String(e));
      setStep("error");
    }
  }

  async function launchAndClose() {
    await invoke("launch", { dir }).catch(() => {});
    close();
  }

  return (
    <div className="win">
      <div className="titlebar" data-tauri-drag-region>
        <button className="tb-close" onClick={close} aria-label="Close">
          &#x2715;
        </button>
      </div>

      <div className="body">
        {/* ---------- INSTALL ---------- */}
        {mode === "install" && step === "welcome" && existing && (
          <div className="step center">
            <img className="logo" src={logo} alt="" />
            <h1 className="title">{APP_NAME}</h1>
            <p className="sub">
              is already installed at
              <br />
              <span className="path">{existing}</span>
            </p>
            <div className="footer center-footer">
              <button className="btn ghost" onClick={close}>
                Close
              </button>
              <button className="btn danger" onClick={doUninstallExisting}>
                Uninstall
              </button>
            </div>
          </div>
        )}

        {mode === "install" && step === "welcome" && !existing && (
          <div className="step center">
            <img className="logo" src={logo} alt="" />
            <h1 className="title">{APP_NAME}</h1>
            <p className="sub">for Windows &middot; {VERSION}</p>
            <button className="btn primary wide" onClick={() => setStep("options")}>
              Install
            </button>
            <p className="hint">Choose your shortcuts on the next step.</p>
          </div>
        )}

        {mode === "install" && step === "options" && (
          <div className="step">
            <h2 className="h2">Install {APP_NAME}</h2>
            <p className="sub-left">Installs to your account folder. Choose your shortcuts:</p>

            <label className="field-label">Shortcuts</label>
            <label className="check">
              <input type="checkbox" checked={desktop} onChange={(e) => setDesktop(e.currentTarget.checked)} />
              <span>Desktop</span>
            </label>
            <label className="check">
              <input type="checkbox" checked={startMenu} onChange={(e) => setStartMenu(e.currentTarget.checked)} />
              <span>Start menu</span>
            </label>

            <div className="footer">
              <button className="btn ghost" onClick={() => setStep("welcome")}>
                Back
              </button>
              <button className="btn primary" onClick={doInstall} disabled={!dir.trim()}>
                Install
              </button>
            </div>
          </div>
        )}

        {step === "working" && (
          <div className="step center">
            <div className="spinner" />
            <p className="working-text">{mode === "uninstall" ? "Removing..." : "Installing..."}</p>
            <div className="bar">
              <div className="bar-fill" />
            </div>
          </div>
        )}

        {mode === "install" && step === "done" && (
          <div className="step center">
            <div className="checkmark">&#x2713;</div>
            <h2 className="h2">{APP_NAME} is installed</h2>
            <p className="sub">Ready to go.</p>
            <div className="footer center-footer">
              <button className="btn ghost" onClick={close}>
                Close
              </button>
              <button className="btn primary" onClick={launchAndClose}>
                Launch
              </button>
            </div>
          </div>
        )}

        {/* ---------- UNINSTALL ---------- */}
        {mode === "uninstall" && step === "welcome" && (
          <div className="step center">
            <img className="logo" src={logo} alt="" />
            <h1 className="title">Uninstall {APP_NAME}?</h1>
            <p className="sub">This removes the app and your saved data (sign-in and cached photos) from this computer.</p>
            <div className="footer center-footer">
              <button className="btn ghost" onClick={close}>
                Cancel
              </button>
              <button className="btn danger" onClick={doUninstall}>
                Uninstall
              </button>
            </div>
          </div>
        )}

        {mode === "uninstall" && step === "done" && (
          <div className="step center">
            <div className="checkmark">&#x2713;</div>
            <h2 className="h2">{APP_NAME} has been removed</h2>
            <div className="footer center-footer">
              <button className="btn primary" onClick={close}>
                Close
              </button>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="step center">
            <div className="checkmark err">!</div>
            <h2 className="h2">Something went wrong</h2>
            <p className="err-text">{error}</p>
            <div className="footer center-footer">
              <button className="btn ghost" onClick={close}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
