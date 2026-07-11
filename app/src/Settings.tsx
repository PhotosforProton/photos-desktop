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

import { useEffect, type CSSProperties } from "react";
import { CloseIcon } from "./icons";
import { applyTheme, PALETTES, resolvedMode, type PaletteKey, type ThemeMode } from "./theme";
import { BROWSER_LANG, useLang, useT, type Lang } from "./i18n";
import "./Settings.css";

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
};

export const DEFAULT_SETTINGS: AppSettings = {
  hideAlbumPhotos: false,
  lockOnHide: false,
  debug: false,
  theme: "dark",
  palette: "default",
  lang: BROWSER_LANG,
};

const THEMES: { value: ThemeMode; labelKey: string }[] = [
  { value: "dark", labelKey: "settings.theme.dark" },
  { value: "light", labelKey: "settings.theme.light" },
  { value: "system", labelKey: "settings.theme.system" },
];

// Language names stay in their own tongue, so they are not run through `t`.
const LANGS: { value: Lang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hu", label: "Magyar" },
];

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

        <h3 className="st-section">{t("settings.appearance")}</h3>

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
                style={{ "--sw": p.surfaces ? p.surfaces.bg0 : light ? p.light.accent : p.dark.accent } as CSSProperties}
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
          <div className="st-seg" role="group" aria-label={t("settings.language")}>
            {LANGS.map((l) => (
              <button
                key={l.value}
                className={`st-seg-btn${settings.lang === l.value ? " on" : ""}`}
                aria-pressed={settings.lang === l.value}
                onClick={() => pickLang(l.value)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <h3 className="st-section">{t("settings.timeline")}</h3>

        <label className="st-row">
          <div className="st-text">
            <div className="st-label">{t("settings.hideAlbum")}</div>
            <div className="st-desc">{t("settings.hideAlbumDesc")}</div>
          </div>
          <input
            className="st-switch"
            type="checkbox"
            checked={settings.hideAlbumPhotos}
            onChange={(e) => onChange({ ...settings, hideAlbumPhotos: e.currentTarget.checked })}
          />
        </label>

        <h3 className="st-section">{t("settings.security")}</h3>

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
    </div>
  );
}
