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

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Confirm } from "../components/Confirm";
import { CloseIcon } from "../components/icons";
import { formatBytes } from "../components/ProfileMenu";
import { unpinAllOffline, watchOffline, type OfflineStatus } from "../lib/offline";
import { applyTheme, PALETTES, resolvedMode, type PaletteKey, type ThemeMode } from "../lib/theme";
import { BROWSER_LANG, LANGS, useLang, useT, type Lang } from "../lib/i18n";
import "../styles/Settings.css";

export type AppSettings = {
  /** Matches Android's "Hide photos in Drive albums". Off by default. */
  hideAlbumPhotos: boolean;
  /** Lock the app when the window is hidden to the tray, so reopening needs the password. Off by default. */
  lockOnHide: boolean;
  /** Show a live memory HUD (JS + sidecar heap, cache sizes). Off by default. */
  debug: boolean;
  theme: ThemeMode;
  /** Accent palette, mirrored from Android. "default" is the Proton purple. */
  palette: PaletteKey;
  lang: Lang;
  /**
   * Photo grid zoom step, an index into the grid's cell-size ladder (0 = smallest).
   * Persisted so the grid reopens at the size the user left it at, rather than
   * snapping back to the default on every launch.
   */
  zoom: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  hideAlbumPhotos: false,
  lockOnHide: false,
  debug: false,
  theme: "dark",
  palette: "default",
  lang: BROWSER_LANG,
  zoom: 1,
};

const THEMES: { value: ThemeMode; labelKey: string }[] = [
  { value: "dark", labelKey: "settings.theme.dark" },
  { value: "light", labelKey: "settings.theme.light" },
  { value: "system", labelKey: "settings.theme.system" },
];

type Category =
  | "general"
  | "appearance"
  | "timeline"
  | "storage"
  | "explorer"
  | "fileTypes"
  | "security";

/** The left rail, in reading order. Each pane titles itself with the same label. */
const CATEGORIES: { key: Category; labelKey: string }[] = [
  { key: "general", labelKey: "settings.general" },
  { key: "appearance", labelKey: "settings.appearance" },
  { key: "timeline", labelKey: "settings.timeline" },
  { key: "storage", labelKey: "settings.storage" },
  { key: "explorer", labelKey: "settings.explorer" },
  { key: "fileTypes", labelKey: "settings.fileTypes" },
  { key: "security", labelKey: "settings.security" },
];

type Usage = { bytes: number; photos: number };

/**
 * One kind of local storage: what it costs, and the button that reclaims it.
 *
 * The panel shows two of these because a photo can be kept in two unrelated places:
 * encrypted inside the app (available offline), or downloaded as an ordinary file under
 * the Explorer mount. Either can hold a photo the other does not, and adding the two
 * figures together would describe neither, so each is measured, named and reclaimed on
 * its own.
 *
 * Everything here arrives already resolved: the caller does its own counting and
 * translating, which is what lets one component serve both without a flag saying which
 * of the two it is this time.
 */
function UsageBlock({
  heading,
  size,
  detail,
  action,
  actionDisabled,
  onAction,
  progressPct,
  note,
  error,
}: {
  heading: string;
  /** The formatted size, or null while the measurement is still out. */
  size: string | null;
  detail: string;
  action: string;
  actionDisabled: boolean;
  onAction: () => void;
  /** 0-100 while a pass is running, or null when none is. */
  progressPct: number | null;
  note: string;
  /** A refusal from the last pass, which takes the note's place while it stands. */
  error?: string;
}) {
  const t = useT();
  return (
    <>
      <div className="st-subhead">{heading}</div>
      <div className="st-usage">
        {size === null ? (
          <div className="st-usage-sub">{t("common.loading")}</div>
        ) : (
          <>
            <div className="st-usage-main">
              <div className="st-usage-text">
                <div className="st-usage-size">{size}</div>
                <div className="st-usage-sub">{detail}</div>
              </div>
              <button className="st-free-btn" disabled={actionDisabled} onClick={onAction}>
                {action}
              </button>
            </div>
            {progressPct !== null && (
              <div
                className="st-progress"
                role="progressbar"
                aria-valuenow={Math.round(progressPct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="st-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            )}
          </>
        )}
      </div>
      <p className={`st-note${error ? " bad" : ""}`}>{error || note}</p>
    </>
  );
}

/**
 * Storage: what is kept on this machine, and the buttons that reclaim it.
 * Mounted with its pane, so the Explorer measuring pass (a directory-entry read per
 * placeholder) only runs when the user actually opens it.
 */
function StoragePane({
  autoDownload,
  onAutoDownload,
  explorer,
}: {
  autoDownload: boolean;
  onAutoDownload: (on: boolean) => void;
  explorer: boolean;
}) {
  const t = useT();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  // Whichever block last refused, so it can say so. The host logs the reason, which is
  // no help at all to the person watching the button go back to how it was.
  const [failed, setFailed] = useState<"explorer" | "offline" | null>(null);

  // The app's own copies. Watched rather than measured: the sidecar owns them, and a
  // batch still landing must show its count climbing here too.
  const [offline, setOffline] = useState<OfflineStatus | null>(null);
  const [confirmingOffline, setConfirmingOffline] = useState(false);
  const [removingOffline, setRemovingOffline] = useState(false);
  useEffect(() => watchOffline(setOffline), []);

  const measure = useCallback(async () => {
    setUsage(await invoke<Usage>("local_usage").catch(() => null));
  }, []);
  useEffect(() => {
    void measure();
  }, [measure]);

  // How far the pass has got, so a large library shows movement instead of a
  // button that just sits there.
  useEffect(() => {
    const un = listen<{ done: number; total: number }>("freeup-progress", (e) =>
      setProgress(e.payload),
    );
    return () => {
      void un.then((f) => f());
    };
  }, []);

  async function freeUpAll() {
    setConfirming(false);
    setProgress(null);
    setFailed(null);
    setBusy(true);
    try {
      await invoke("free_up_all");
    } catch {
      setFailed("explorer");
    }
    setBusy(false);
    setProgress(null);
    // The refreshed size is the rest of the answer: a pass that freed some of it and
    // then gave up still says how much is left.
    await measure();
  }

  async function removeAllOffline() {
    setConfirmingOffline(false);
    setFailed(null);
    setRemovingOffline(true);
    // The sidecar answers with the state it is left in, and the watcher publishes it,
    // so the figures above refresh without a second read.
    try {
      await unpinAllOffline();
    } catch {
      setFailed("offline");
    }
    setRemovingOffline(false);
  }

  const bytes = usage?.bytes ?? 0;
  const pct = progress && progress.total > 0 ? (progress.done / progress.total) * 100 : 0;

  const offlineBytes = offline?.bytes ?? 0;
  const offlineCount = offline?.ready ?? 0;
  // A batch still saving is the one thing that moves on its own here, so it takes the
  // bar and the button's label; removing is quick enough to just say so.
  const saving = !!offline?.running && offline.total > 0;

  return (
    <div className="st-rows">
      <UsageBlock
        heading={t("settings.storageOffline")}
        size={offline === null ? null : formatBytes(offlineBytes)}
        detail={
          offlineCount === 0
            ? t("settings.offlineNone")
            : t(
                offlineCount === 1 ? "settings.offlineCount.one" : "settings.offlineCount.other",
                { count: offlineCount },
              )
        }
        action={
          saving
            ? t("settings.offlineSaving", { done: offline.done, total: offline.total })
            : removingOffline
              ? t("settings.offlineRemoving")
              : offlineBytes === 0
                ? t("settings.offlineRemoveNothing")
                : t("settings.offlineRemoveAll", { size: formatBytes(offlineBytes) })
        }
        actionDisabled={removingOffline || saving || offlineBytes === 0}
        onAction={() => setConfirmingOffline(true)}
        progressPct={saving ? (offline.done / offline.total) * 100 : null}
        note={t("settings.offlineDesc")}
        error={failed === "offline" ? t("settings.freeUpFailed") : undefined}
      />

      <UsageBlock
        heading={t("settings.storageExplorer")}
        size={usage === null ? null : formatBytes(bytes)}
        detail={
          usage === null || usage.photos === 0
            ? t("settings.downloadedNone")
            : t(
                usage.photos === 1
                  ? "settings.downloadedCount.one"
                  : "settings.downloadedCount.other",
                { count: usage.photos },
              )
        }
        action={
          busy
            ? t("settings.freeingUp")
            : bytes === 0
              ? t("settings.freeUpNothing")
              : t("settings.freeUpAll", { size: formatBytes(bytes) })
        }
        actionDisabled={busy || bytes === 0}
        onAction={() => setConfirming(true)}
        progressPct={busy ? pct : null}
        note={t("settings.downloadedDesc")}
        error={failed === "explorer" ? t("settings.freeUpFailed") : undefined}
      />

      {/* Automatic downloads run through the Explorer mount, so with the mount off the
          switch says why instead of sitting there doing nothing when flipped. */}
      <label className={`st-row${explorer ? "" : " off"}`}>
        <div className="st-text">
          <div className="st-label">{t("settings.autoDownload")}</div>
          <div className="st-desc">
            {explorer ? t("settings.autoDownloadDesc") : t("settings.autoDownloadNeedsExplorer")}
          </div>
        </div>
        <input
          className="st-switch"
          type="checkbox"
          checked={explorer && autoDownload}
          disabled={!explorer}
          onChange={(e) => onAutoDownload(e.currentTarget.checked)}
        />
      </label>

      {confirming && (
        <Confirm
          title={t("confirm.freeUpAllTitle")}
          message={t("confirm.freeUpAllMessage", { size: formatBytes(bytes) })}
          confirmLabel={t("confirm.freeUpAllConfirm")}
          onConfirm={() => void freeUpAll()}
          onCancel={() => setConfirming(false)}
        />
      )}

      {confirmingOffline && (
        <Confirm
          title={t("confirm.removeOfflineAllTitle")}
          message={t("confirm.removeOfflineAllMessage", { size: formatBytes(offlineBytes) })}
          confirmLabel={t("confirm.removeOfflineAllConfirm")}
          onConfirm={() => void removeAllOffline()}
          onCancel={() => setConfirmingOffline(false)}
        />
      )}
    </div>
  );
}

/**
 * File types: the "Open with" entries this app may add and take back out, and a way
 * to the one choice it may not make. Mounted with its pane, so the registry is read
 * when the pane opens and the switch shows what is actually registered on this
 * machine, including a change made outside the app since it was last looked at.
 */
function FileTypesPane() {
  const t = useT();
  // Null until the registry answers, so the switch never shows a guess.
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  // Whichever of the two last refused. The host logs the reason, which is no help at
  // all to the person watching the switch go back to how it was.
  const [failed, setFailed] = useState<"toggle" | "open" | null>(null);

  useEffect(() => {
    void invoke<boolean>("file_association_enabled")
      .then(setEnabled)
      .catch(() => setEnabled(false));
  }, []);

  async function toggle(on: boolean) {
    const before = enabled;
    setEnabled(on); // answer the click; writing the entries takes a moment
    setFailed(null);
    setBusy(true);
    try {
      await invoke("set_file_association", { enabled: on });
    } catch {
      // Nothing was written, so the switch cannot be left claiming otherwise.
      setEnabled(before);
      setFailed("toggle");
    }
    setBusy(false);
  }

  async function openDefaults() {
    setFailed(null);
    try {
      await invoke("open_default_apps");
    } catch {
      setFailed("open");
    }
  }

  return (
    <div className="st-rows">
      <label className="st-row">
        <div className="st-text">
          <div className="st-label">{t("settings.openWith")}</div>
          <div className="st-desc">{t("settings.openWithDesc")}</div>
        </div>
        <input
          className="st-switch"
          type="checkbox"
          checked={enabled === true}
          disabled={enabled === null || busy}
          onChange={(e) => void toggle(e.currentTarget.checked)}
        />
      </label>
      {failed === "toggle" && <p className="st-note bad">{t("settings.fileTypesFailed")}</p>}

      {/* Windows keeps the default handler behind a hash of its own and takes the
          choice from the user alone, so this is a way to the page that owns it
          rather than a control that could make it. */}
      <div className="st-row">
        <div className="st-text">
          <div className="st-label">{t("settings.defaultApp")}</div>
          <div className="st-desc">{t("settings.defaultAppDesc")}</div>
        </div>
        <button className="st-row-btn" onClick={() => void openDefaults()}>
          {t("settings.defaultAppOpen")}
        </button>
      </div>
      {failed === "open" && <p className="st-note bad">{t("settings.defaultAppFailed")}</p>}
    </div>
  );
}

export function Settings({
  settings,
  onChange,
  onClose,
}: {
  settings: AppSettings;
  onChange: (next: AppSettings) => void;
  onClose: () => void;
}) {
  const t = useT();
  const { setLang } = useLang();
  const [category, setCategory] = useState<Category>("appearance");

  // The "show in File Explorer" preference lives outside the (vault-encrypted)
  // settings so it can be read before sign-in; toggle it via its own commands.
  // Both prefs are read once here rather than per pane, so a pane never renders
  // its switch at the default and then flips it.
  const [showExplorer, setShowExplorer] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  // Starting with Windows is a registry entry rather than a stored setting, for the
  // same reason: Windows has to be able to read it with nobody signed in.
  const [launchAtLogin, setLaunchAtLogin] = useState(false);
  const [restartNeeded, setRestartNeeded] = useState(false);
  useEffect(() => {
    void invoke<boolean>("show_in_explorer").then(setShowExplorer).catch(() => {});
    void invoke<boolean>("auto_download").then(setAutoDownload).catch(() => {});
    void invoke<boolean>("launch_at_login").then(setLaunchAtLogin).catch(() => {});
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function pickTheme(theme: ThemeMode) {
    applyTheme(theme, settings.palette); // repaint immediately, before the write round-trips
    onChange({ ...settings, theme });
  }

  function pickPalette(palette: PaletteKey) {
    applyTheme(settings.theme, palette); // repaint immediately, before the write round-trips
    onChange({ ...settings, palette });
  }

  // Swatch fill reflects what the palette looks like in the active mode; AMOLED
  // shows its true-black identity rather than its (unchanged) purple accent.
  const light = resolvedMode(settings.theme) === "light";

  function pickLang(lang: Lang) {
    setLang(lang); // switch the live UI and persist into the settings object
    onChange({ ...settings, lang });
  }

  return (
    <div className="st-backdrop" onClick={onClose}>
      <div className="st-panel" onClick={(e) => e.stopPropagation()}>
        <div className="st-head">
          <h2 className="st-title">{t("settings.title")}</h2>
          <button className="st-x" onClick={onClose} title={t("common.close")}>
            <CloseIcon size={15} />
          </button>
        </div>

        <div className="st-body">
          <nav className="st-nav" aria-label={t("settings.title")}>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className={`st-nav-item${category === c.key ? " on" : ""}`}
                aria-current={category === c.key ? "page" : undefined}
                onClick={() => setCategory(c.key)}
              >
                {t(c.labelKey)}
              </button>
            ))}
          </nav>

          <div className="st-content">
            <h3 className="st-pane-title">
              {t(CATEGORIES.find((c) => c.key === category)!.labelKey)}
            </h3>

            {category === "appearance" && (
              <div className="st-rows">
                <div className="st-row">
                  <div className="st-text">
                    <div className="st-label">{t("settings.theme")}</div>
                    <div className="st-desc">{t("settings.themeDesc")}</div>
                  </div>
                  <div className="st-seg" role="group" aria-label={t("settings.theme")}>
                    {THEMES.map((th) => (
                      <button
                        key={th.value}
                        className={`st-seg-btn${settings.theme === th.value ? " on" : ""}`}
                        aria-pressed={settings.theme === th.value}
                        onClick={() => pickTheme(th.value)}
                      >
                        {t(th.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="st-row">
                  <div className="st-text">
                    <div className="st-label">{t("settings.palette")}</div>
                    <div className="st-desc">{t("settings.paletteDesc")}</div>
                  </div>
                  <div className="st-swatches" role="group" aria-label={t("settings.palette")}>
                    {PALETTES.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        className={`st-swatch${settings.palette === p.key ? " on" : ""}`}
                        style={
                          {
                            "--sw": p.surfaces
                              ? p.surfaces.bg0
                              : light
                                ? p.light.accent
                                : p.dark.accent,
                          } as CSSProperties
                        }
                        aria-pressed={settings.palette === p.key}
                        aria-label={t(p.labelKey)}
                        title={t(p.labelKey)}
                        onClick={() => pickPalette(p.key)}
                      />
                    ))}
                  </div>
                </div>

                <div className="st-row">
                  <div className="st-text">
                    <div className="st-label">{t("settings.language")}</div>
                    <div className="st-desc">{t("settings.languageDesc")}</div>
                  </div>
                  <select
                    className="st-select"
                    aria-label={t("settings.language")}
                    value={settings.lang}
                    onChange={(e) => pickLang(e.currentTarget.value as Lang)}
                  >
                    {LANGS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {category === "timeline" && (
              <div className="st-rows">
                <label className="st-row">
                  <div className="st-text">
                    <div className="st-label">{t("settings.hideAlbum")}</div>
                    <div className="st-desc">{t("settings.hideAlbumDesc")}</div>
                  </div>
                  <input
                    className="st-switch"
                    type="checkbox"
                    checked={settings.hideAlbumPhotos}
                    onChange={(e) =>
                      onChange({ ...settings, hideAlbumPhotos: e.currentTarget.checked })
                    }
                  />
                </label>
              </div>
            )}

            {category === "storage" && (
              <StoragePane
                explorer={showExplorer}
                autoDownload={autoDownload}
                onAutoDownload={(on) => {
                  setAutoDownload(on);
                  void invoke("set_auto_download", { enabled: on }).catch(() => {});
                }}
              />
            )}

            {category === "general" && (
              <div className="st-rows">
                <label className="st-row">
                  <div className="st-text">
                    <div className="st-label">{t("settings.launchAtLogin")}</div>
                    <div className="st-desc">{t("settings.launchAtLoginDesc")}</div>
                  </div>
                  <input
                    className="st-switch"
                    type="checkbox"
                    checked={launchAtLogin}
                    onChange={(e) => {
                      const on = e.currentTarget.checked;
                      // Shown as set only once it is set: this one writes outside the
                      // app, so a refused write has to move the switch back rather
                      // than leave it saying something that is not true.
                      setLaunchAtLogin(on);
                      void invoke("set_launch_at_login", { enabled: on }).catch(() =>
                        setLaunchAtLogin(!on),
                      );
                    }}
                  />
                </label>
              </div>
            )}

            {category === "explorer" && (
              <div className="st-rows">
                <label className="st-row">
                  <div className="st-text">
                    <div className="st-label">{t("settings.showInExplorer")}</div>
                    <div className="st-desc">{t("settings.showInExplorerDesc")}</div>
                  </div>
                  <input
                    className="st-switch"
                    type="checkbox"
                    checked={showExplorer}
                    onChange={(e) => {
                      const on = e.currentTarget.checked;
                      setShowExplorer(on);
                      setRestartNeeded(true);
                      void invoke("set_show_in_explorer", { enabled: on }).catch(() => {});
                    }}
                  />
                </label>

                {restartNeeded && (
                  <div className="st-restart">
                    <span>{t("settings.restartNeeded")}</span>
                    <button className="st-restart-btn" onClick={() => void invoke("restart_app")}>
                      {t("settings.restartNow")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {category === "fileTypes" && <FileTypesPane />}

            {category === "security" && (
              <div className="st-rows">
                <label className="st-row">
                  <div className="st-text">
                    <div className="st-label">{t("settings.lockOnHide")}</div>
                    <div className="st-desc">{t("settings.lockOnHideDesc")}</div>
                  </div>
                  <input
                    className="st-switch"
                    type="checkbox"
                    checked={settings.lockOnHide}
                    onChange={(e) => onChange({ ...settings, lockOnHide: e.currentTarget.checked })}
                  />
                </label>

                <label className="st-row">
                  <div className="st-text">
                    <div className="st-label">{t("settings.debug")}</div>
                    <div className="st-desc">{t("settings.debugDesc")}</div>
                  </div>
                  <input
                    className="st-switch"
                    type="checkbox"
                    checked={settings.debug}
                    onChange={(e) => onChange({ ...settings, debug: e.currentTarget.checked })}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
