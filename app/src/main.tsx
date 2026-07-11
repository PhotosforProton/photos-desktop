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

import ReactDOM from "react-dom/client";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
// Tokens first: every other stylesheet resolves its colours against them.
import "./theme.css";
import App from "./App";
import { TrayPopup } from "./TrayPopup";
import { LangProvider } from "./i18n";
import { applyTheme, type ThemeMode } from "./theme";

// The Rust host loads this same frontend into a frameless, transparent window
// labelled "tray_popup". When that is the window we are in, render the little
// tray menu instead of the full app.
const isTrayPopup = getCurrentWindow().label === "tray_popup";

// The tray popup skips <App/>, so it has to restore the saved theme itself the
// way App does, otherwise it would always paint in the default dark palette.
if (isTrayPopup) {
  (async () => {
    try {
      const raw = await invoke<string | null>("store_get", { name: "settings" });
      if (raw) {
        const s = JSON.parse(raw);
        applyTheme((s.theme as ThemeMode) ?? "dark", s.palette);
      }
    } catch {
      /* keep the default dark theme */
    }
  })();
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <LangProvider>{isTrayPopup ? <TrayPopup /> : <App />}</LangProvider>,
);

// The main window ships hidden (visible:false) so the empty transparent frame is
// never seen while the WebView loads. Reveal it once the first frame has painted.
// The tray popup manages its own visibility (shown on tray right-click), so leave it.
if (!isTrayPopup) {
  const win = getCurrentWindow();
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      void win.show();
      void win.setFocus();
    }),
  );
}
