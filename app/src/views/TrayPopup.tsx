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
import { emit, listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { OpenWindowIcon, PowerIcon, RefreshIcon, SignOutIcon } from "../components/icons";
import { rpc } from "../lib/rpc";
// Reuse the profile menu's account shape, storage formatting and header styles
// so the popup header is identical to the one inside the main window.
import { barColor, formatBytes, type Account } from "../components/ProfileMenu";
import { useT } from "../lib/i18n";
import "../styles/ProfileMenu.css";
import "../styles/TrayPopup.css";

/**
 * The system-tray menu. Rendered (instead of <App/>) into the transparent,
 * frameless "tray_popup" window. The page body is transparent; this card is the
 * only visible surface, so it carries the rounded corners, border and shadow.
 */
export function TrayPopup() {
  const t = useT();
  const [account, setAccount] = useState<Account | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Account identity and Drive storage, exactly as the main window's avatar.
  // The popup window is created before sign-in, so refetch on mount AND every
  // time the tray reopens it (the host emits "tray-shown" on show).
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const info = await rpc<Account>("getAccountInfo");
        if (!cancelled) setAccount(info);
      } catch {
        /* not signed in yet, or transient: keep the placeholder */
      }
    }
    void load();
    // On each open the host emits "tray-shown": refetch, and pull focus so the
    // very first click outside dismisses it (Windows will not focus it on show).
    const unlisten = listen("tray-shown", () => {
      void load();
      void getCurrentWindow().setFocus();
    });
    return () => {
      cancelled = true;
      void unlisten.then((f) => f());
    };
  }, []);

  // Live sync status. Seed it from the host on open (the mount may already be
  // busy), then follow the "mount-busy" transitions the host emits.
  useEffect(() => {
    let cancelled = false;
    async function loadBusy() {
      try {
        const b = await invoke<boolean>("sync_busy");
        if (!cancelled) setSyncing(b);
      } catch {
        /* ignore */
      }
    }
    void loadBusy();
    const unBusy = listen<boolean>("mount-busy", (e) => setSyncing(!!e.payload));
    const unShown = listen("tray-shown", () => void loadBusy());
    return () => {
      cancelled = true;
      void unBusy.then((f) => f());
      void unShown.then((f) => f());
    };
  }, []);

  // Dismiss on click-outside: losing window focus hides the popup.
  useEffect(() => {
    function onBlur() {
      void invoke("hide_tray_popup");
    }
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  // Escape dismisses the popup, matching every other transient surface.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") void invoke("hide_tray_popup");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function openMain() {
    await invoke("open_main_from_tray").catch(() => {});
  }

  async function syncNow() {
    setSyncing(true); // optimistic; the host confirms via "mount-busy"
    // Bounded refresh: syncs only the albums kept offline and reloads the view. It
    // never bulk-downloads the whole library.
    await invoke("sync_now").catch(() => {});
  }

  async function signOut() {
    await rpc("signOut").catch(() => {});
    await emit("tray-signout").catch(() => {});
    await invoke("hide_tray_popup").catch(() => {});
  }

  async function quit() {
    await invoke("quit_app").catch(() => {});
  }

  const fraction = account && account.maxSpace > 0 ? account.usedSpace / account.maxSpace : 0;
  const percent = Math.round(fraction * 100);

  return (
    <div className="tray-root">
      <div className="tray-card">
        <div className="pm-head">
          <div className="pm-circle">{account?.initial ?? "?"}</div>
          <div className="pm-id">
            {account ? (
              <>
                <div className="pm-name">{account.displayName}</div>
                <div className="pm-email">{account.email}</div>
              </>
            ) : (
              <>
                <div className="tray-skeleton tray-skeleton-name" />
                <div className="tray-skeleton tray-skeleton-email" />
              </>
            )}
          </div>
        </div>

        {!account ? (
          <div className="pm-storage">
            <div className="pm-storage-row">
              <span className="pm-dim">{t("profile.storage")}</span>
            </div>
            <div className="pm-bar">
              <div className="tray-skeleton tray-skeleton-bar" />
            </div>
          </div>
        ) : account.maxSpace > 0 ? (
          <div className="pm-storage">
            <div className="pm-storage-row">
              <span>{t("profile.storage")}</span>
              <span className="pm-dim">{percent}%</span>
            </div>
            <div className="pm-bar">
              <div
                className="pm-barfill"
                style={{ width: `${Math.min(100, percent)}%`, background: barColor(fraction) }}
              />
            </div>
            <div className="pm-storage-row pm-dim">
              <span>{t("profile.used", { size: formatBytes(account.usedSpace) })}</span>
              <span>{t("profile.total", { size: formatBytes(account.maxSpace) })}</span>
            </div>
          </div>
        ) : null}

        <div className="pm-sep" />

        <div className="tray-status" role="status" aria-live="polite">
          <span className={`tray-dot${syncing ? " on" : ""}`} aria-hidden="true" />
          <span>{syncing ? t("tray.syncing") : t("tray.synced")}</span>
        </div>
        <button className="tray-row" onClick={syncNow} disabled={syncing}>
          <span className={syncing ? "tray-spin" : undefined}>
            <RefreshIcon size={16} />
          </span>
          <span>{t("tray.syncNow")}</span>
        </button>

        <button className="tray-row" onClick={openMain}>
          <OpenWindowIcon size={16} />
          <span>{t("tray.open")}</span>
        </button>
        <button className="tray-row" onClick={signOut}>
          <SignOutIcon size={16} />
          <span>{t("profile.signOut")}</span>
        </button>
        <button className="tray-row danger" onClick={quit}>
          <PowerIcon size={16} />
          <span>{t("menu.quit")}</span>
        </button>
      </div>
    </div>
  );
}
