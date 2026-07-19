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

import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import type { UploadStatus } from "../hooks/useUploads";
import { useT } from "../lib/i18n";
import { CheckIcon, CloseIcon, UploadArrowIcon } from "./icons";
import "../styles/Upload.css";

const MEDIA_EXTENSIONS = [
  "jpg", "jpeg", "png", "webp", "gif", "avif", "tif", "tiff", "heic", "heif", "dng",
  "mp4", "mov", "m4v", "webm", "mkv", "3gp",
];

type Props = {
  status: UploadStatus;
  running: boolean;
  /** A refused upload, from here or from a drop anywhere else in the window. */
  error: string;
  start: (paths: string[]) => Promise<void>;
  cancel: () => void;
  clear: () => void;
  onClose: () => void;
};

/**
 * The upload panel. Dropping is handled window-wide by `useUploads`, so this is
 * only the picker plus the queue view; it can be opened and closed mid-upload.
 */
export function Upload({ status, running, error, start, cancel, clear, onClose }: Props) {
  const t = useT();
  // Only the file picker's own failures. A refused upload belongs to `useUploads`,
  // which every way in shares, so both routes report through the one line below.
  const [pickError, setPickError] = useState("");

  async function pick(directory: boolean) {
    setPickError("");
    try {
      const selected = await open({
        multiple: !directory,
        directory,
        filters: directory
          ? undefined
          : [{ name: t("upload.filterName"), extensions: MEDIA_EXTENSIONS }],
      });
      if (!selected) return;
      await start(Array.isArray(selected) ? selected : [selected as string]);
    } catch (e) {
      setPickError(String(e));
    }
  }

  const settled = status.done + status.skipped + status.failed;
  const progress = status.total > 0 ? settled / status.total : 0;

  return (
    <div className="up-backdrop" onClick={onClose}>
      <div className="up-panel" onClick={(e) => e.stopPropagation()}>
        <div className="up-head">
          <h2 className="up-title">{t("upload.title")}</h2>
          <button className="up-x" onClick={onClose} title={t("common.close")}>
            <CloseIcon size={12} />
          </button>
        </div>

        <div className="up-drop">
          <div className="up-dropicon">
            <UploadArrowIcon size={20} />
          </div>
          <p className="up-droptitle">{t("upload.dropHint")}</p>
          <p className="up-dropsub">{t("upload.dropSub")}</p>
          <div className="up-actions center">
            <button className="up-btn" onClick={() => pick(false)}>
              {t("upload.chooseFiles")}
            </button>
            <button className="up-btn ghost" onClick={() => pick(true)}>
              {t("upload.chooseFolder")}
            </button>
          </div>
        </div>

        {status.total > 0 && (
          <>
            <div className="up-bar">
              <div className="up-barfill" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <div className="up-counts">
              <span>
                {settled} / {status.total}
              </span>
              {status.skipped > 0 && (
                <span className="up-dim">{t("upload.alreadyThere", { count: status.skipped })}</span>
              )}
              {status.failed > 0 && (
                <span className="up-bad">{t("upload.failedCount", { count: status.failed })}</span>
              )}
              <span className="up-spacer" />
              {running ? (
                <button className="up-link" onClick={cancel}>
                  {t("common.cancel")}
                </button>
              ) : (
                <button className="up-link" onClick={clear}>
                  {t("upload.clear")}
                </button>
              )}
            </div>

            <ul className="up-list">
              {status.items.map((it, i) => (
                <li className={`up-item ${it.status}`} key={`${it.name}-${i}`}>
                  <span className="up-name" title={it.name}>
                    {it.name}
                  </span>
                  {it.album && <span className="up-album">{it.album}</span>}
                  <span className="up-state">
                    {it.status === "done"
                      ? <CheckIcon size={11} />
                      : it.status === "uploading"
                        ? t("upload.statusUploading")
                        : it.status === "skipped"
                          ? t("upload.statusSkipped")
                          : it.status === "failed"
                            ? (it.error ?? t("upload.statusFailed"))
                            : t("upload.statusQueued")}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {(error || pickError) && <p className="up-error">{error || pickError}</p>}
      </div>
    </div>
  );
}
