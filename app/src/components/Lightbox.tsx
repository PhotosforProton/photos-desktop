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
import { rpc } from "../lib/rpc";
import { cachedPreview, dropPreview, loadPreview } from "../lib/previewStore";
import { Confirm } from "./Confirm";
import { PhotoViewer } from "./PhotoViewer";
import { CloseIcon, InfoIcon, TrashIcon } from "./icons";
import { useT } from "../lib/i18n";
import "../styles/Lightbox.css";

type Details = {
  uid: string;
  name: string;
  type: string;
  mediaType: string | null;
  captureTime: number | null;
  creationTime: number;
  modificationTime: number | null;
  size: number | null;
  storageSize: number | null;
  sha1: string | null;
  sha1Verified: boolean | null;
  extra: Record<string, unknown> | null;
  tags: number[];
  albumCount: number;
  isShared: boolean;
  isSharedPublicly: boolean;
  owner: string | null;
};

type Props = {
  uid: string;
  fallbackUrl: string | null;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onTrashed: (uid: string) => void;
  onRenamed: (uid: string, name: string) => void;
  /** Whether this photo is kept offline (hydrated) — drives Download vs Free up. */
  isLocal?: boolean;
};

function formatBytes(n: number | null): string {
  if (n === null || n === undefined) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = n;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleString(navigator.language || "en");
}

/** Width/height live in encrypted extended attributes, whose casing varies. */
function dimensionsOf(extra: Record<string, unknown> | null): string | null {
  if (!extra) return null;
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = extra[k];
      if (typeof v === "number" && v > 0) return v;
    }
    return null;
  };
  const w = pick("Width", "width");
  const h = pick("Height", "height");
  return w && h ? `${w} × ${h}` : null;
}

/** Decode base64 video bytes (from the sidecar) into a playable Blob. */
function b64ToBlob(b64: string, mime: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function Lightbox({
  uid,
  fallbackUrl,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
  onTrashed,
  onRenamed,
  isLocal = false,
}: Props) {
  const t = useT();
  const [preview, setPreview] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoState, setVideoState] = useState<"idle" | "loading" | "ready" | "toolarge" | "error">(
    "idle",
  );
  const [details, setDetails] = useState<Details | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  const isVideo = (details?.mediaType ?? "").startsWith("video/");

  useEffect(() => {
    setError("");
    setRenaming(false);
    setConfirming(false);
    setDetails(null);
    setVideoUrl(null);
    setVideoState("idle");

    let cancelled = false;
    // A prefetched neighbour is already here, so stepping across is instant.
    const cached = cachedPreview(uid) ?? null;
    setPreview(cached);
    setLoadingPreview(cached === null);

    (async () => {
      try {
        const [meta, hd] = await Promise.all([
          rpc<Details>("getNodeDetails", { uid }),
          loadPreview(uid),
        ]);
        if (cancelled) return;
        setPreview(hd);
        setDetails(meta);
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        // Whether the HD arrived or not, the load attempt is over — stop the
        // spinner. A failed preview simply falls back to the grid thumbnail
        // instead of spinning forever.
        if (!cancelled) setLoadingPreview(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  // A video: fetch its bytes (kept in memory) and wrap them in a Blob to play.
  // Images skip this entirely and keep using the HD still above.
  useEffect(() => {
    if (!isVideo) return;
    let url: string | null = null;
    let cancelled = false;
    setVideoState("loading");
    (async () => {
      try {
        const v = await rpc<{ base64: string; mime: string }>("getVideo", { uid });
        if (cancelled) return;
        url = URL.createObjectURL(b64ToBlob(v.base64, v.mime));
        setVideoUrl(url);
        setVideoState("ready");
      } catch (e) {
        if (!cancelled) {
          setVideoState(String(e).includes("VIDEO_TOO_LARGE") ? "toolarge" : "error");
        }
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [uid, isVideo]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (renaming) {
        if (e.key === "Escape") setRenaming(false);
        return;
      }
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && hasNext) onNext();
      else if (e.key === "ArrowLeft" && hasPrev) onPrev();
      else if (e.key === "Delete") setConfirming(true);
      else if (e.key.toLowerCase() === "i") setShowDetails((s) => !s);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function trash() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const results = await rpc<{ uid: string; ok: boolean; error?: string }[]>("trashPhotos", {
        uids: [uid],
      });
      const failure = results.find((r) => !r.ok);
      if (failure) {
        setError(failure.error ?? t("viewer.trashFailed"));
      } else {
        dropPreview(uid);
        onTrashed(uid);
      }
    } catch (e) {
      setError(String(e));
    }
    setBusy(false);
  }

  async function commitRename() {
    const name = draftName.trim();
    if (!name || name === details?.name) {
      setRenaming(false);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await rpc<{ uid: string; name: string }>("renamePhoto", { uid, name });
      setDetails((d) => (d ? { ...d, name: res.name } : d));
      onRenamed(uid, res.name);
      setRenaming(false);
    } catch (e) {
      setError(String(e));
    }
    setBusy(false);
  }

  // Keep the photo offline (hydrate its placeholder) or free it up (dehydrate back
  // to cloud-only). The grid's poll refreshes the badge and this button afterwards.
  async function download() {
    await invoke("pin_selected", { uids: [uid] }).catch(() => {});
  }
  async function freeUp() {
    await invoke("free_up_selected", { uids: [uid] }).catch(() => {});
  }

  const title = details?.name ?? "";
  const dims = dimensionsOf(details?.extra ?? null);

  return (
    <div className="lbx" onClick={onClose}>
      <div className="lbx-bar" onClick={(e) => e.stopPropagation()}>
        <div className="lbx-left">
          <button
            className={`lbx-ibtn ${showDetails ? "sel" : ""}`}
            onClick={() => setShowDetails((s) => !s)}
            title={t("viewer.detailsShortcut")}
          >
            <InfoIcon />
          </button>
          <button
            className="lbx-ibtn danger"
            disabled={busy}
            onClick={() => setConfirming(true)}
            title={t("viewer.trashShortcut")}
          >
            <TrashIcon />
          </button>
          <button
            className="lbx-ibtn"
            onClick={() => void (isLocal ? freeUp() : download())}
            title={isLocal ? t("viewer.freeUp") : t("viewer.download")}
          >
            {isLocal ? "☁" : "⭳"}
          </button>
        </div>

        {renaming ? (
          <input
            autoFocus
            className="lbx-rename"
            value={draftName}
            onChange={(e) => setDraftName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void commitRename();
            }}
            onBlur={() => setRenaming(false)}
          />
        ) : (
          <button
            className="lbx-title"
            title={t("viewer.rename")}
            disabled={!details || busy}
            onClick={() => {
              setDraftName(details?.name ?? "");
              setRenaming(true);
            }}
          >
            {title || "…"}
          </button>
        )}

        <div className="lbx-right">
          <button className="lbx-ibtn" onClick={onClose} title={t("viewer.closeShortcut")}>
            <CloseIcon />
          </button>
        </div>
      </div>

      {error && (
        <div className="lbx-error" onClick={(e) => e.stopPropagation()}>
          {error}
        </div>
      )}

      <div className="lbx-stage" onClick={onClose}>
        {hasPrev && (
          <button
            className="lbx-nav prev"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            title={t("viewer.prev")}
          >
            ‹
          </button>
        )}

        {isVideo ? (
          videoUrl && videoState === "ready" ? (
            <video
              className="lbx-video"
              src={videoUrl}
              poster={preview ?? fallbackUrl ?? undefined}
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
              onError={() => setVideoState("error")}
            />
          ) : (
            <div className="lbx-video-fallback" onClick={(e) => e.stopPropagation()}>
              {(preview ?? fallbackUrl) && (
                <img className="lbx-video-poster" src={(preview ?? fallbackUrl)!} alt="" />
              )}
              <div className="lbx-video-note">
                {videoState === "toolarge"
                  ? t("viewer.videoTooLarge")
                  : videoState === "error"
                    ? t("viewer.videoError")
                    : t("viewer.videoLoading")}
              </div>
            </div>
          )
        ) : (
          <PhotoViewer src={preview ?? fallbackUrl ?? undefined} loading={loadingPreview} />
        )}

        {hasNext && (
          <button
            className="lbx-nav next"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            title={t("viewer.next")}
          >
            ›
          </button>
        )}
      </div>

      {showDetails && (
        <div className="lbx-details-backdrop" onClick={() => setShowDetails(false)}>
          <div className="lbx-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lbx-details-head">
              <h3>{t("viewer.details")}</h3>
              <button
                className="lbx-ibtn"
                onClick={() => setShowDetails(false)}
                title={t("common.close")}
              >
                <CloseIcon size={14} />
              </button>
            </div>
            {!details ? (
              <p className="lbx-dim">{t("common.loading")}</p>
            ) : (
              <dl>
              <dt>{t("viewer.name")}</dt>
              <dd>{details.name || "—"}</dd>
              <dt>{t("viewer.type")}</dt>
              <dd>{details.mediaType ?? details.type}</dd>
              {dims && (
                <>
                  <dt>{t("viewer.dimensions")}</dt>
                  <dd>{dims}</dd>
                </>
              )}
              <dt>{t("viewer.taken")}</dt>
              <dd>{formatDate(details.captureTime)}</dd>
              <dt>{t("viewer.added")}</dt>
              <dd>{formatDate(details.creationTime)}</dd>
              <dt>{t("viewer.modified")}</dt>
              <dd>{formatDate(details.modificationTime)}</dd>
              <dt>{t("viewer.size")}</dt>
              <dd>{formatBytes(details.size)}</dd>
              <dt>{t("viewer.onServer")}</dt>
              <dd>{formatBytes(details.storageSize)}</dd>
              <dt>{t("viewer.albums")}</dt>
              <dd>{details.albumCount}</dd>
              <dt>{t("viewer.shared")}</dt>
              <dd>
                {details.isSharedPublicly
                  ? t("viewer.sharedPublic")
                  : details.isShared
                    ? t("viewer.sharedPeople")
                    : t("viewer.sharedNo")}
              </dd>
                {details.sha1 && (
                  <>
                    <dt>SHA-1</dt>
                    <dd className="lbx-mono">{details.sha1}</dd>
                  </>
                )}
              </dl>
            )}
          </div>
        </div>
      )}

      {confirming && (
        <Confirm
          title={t("confirm.trashTitle")}
          message={t("confirm.trashName", { name: details?.name ?? t("confirm.thisPhoto") })}
          confirmLabel={t("confirm.trashConfirm")}
          danger
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            void trash();
          }}
        />
      )}
    </div>
  );
}
