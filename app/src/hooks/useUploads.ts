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

import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { rpc } from "../lib/rpc";

export type ItemStatus = "pending" | "uploading" | "done" | "skipped" | "failed";
export type UploadItem = { name: string; album: string | null; status: ItemStatus; error?: string };
export type UploadStatus = {
  running: boolean;
  total: number;
  done: number;
  skipped: number;
  failed: number;
  items: UploadItem[];
};

/**
 * What the host prepared for one drop, keyed by the path each file was named by: a
 * staged picture of what the sidecar cannot open, and what the shell knew about the same
 * files. Both are best-effort, and a file either could not be answered for is absent.
 */
type FramePrep = {
  frames: Record<string, string>;
  media: Record<string, { width?: number; height?: number; durationSec?: number }>;
};

const EMPTY: UploadStatus = { running: false, total: 0, done: 0, skipped: 0, failed: 0, items: [] };

/** How much of a status has come to rest: uploaded, skipped as a duplicate, or failed. */
const settledIn = (s: UploadStatus): number => s.done + s.skipped + s.failed;

const POLL_MS = 400;

/**
 * How long an unchanged status is believed to mean "not yet" rather than "nothing".
 *
 * The sidecar walks the drop, folders and all, before the first item appears, so a
 * status that has not moved right after a start is only the plan being made. A drop
 * holding nothing it can upload reports exactly the same thing, and reports it forever:
 * the two cannot be told apart from here, so a standing status is given this long and
 * then taken at its word. Without it the poll ran for the rest of the session on the
 * one channel every thumbnail and preview also queues on.
 */
const IDLE_GIVE_UP_MS = 30_000;

/**
 * Owns uploading for the whole window: a drop anywhere is accepted, progress is
 * polled, and a second drop while one is running simply appends to the queue.
 */
export function useUploads(onFinished: () => void) {
  const [status, setStatus] = useState<UploadStatus>(EMPTY);
  const [dragging, setDragging] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState("");
  /** The last reading, so a new drop can tell what was already in the record. */
  const latest = useRef<UploadStatus>(EMPTY);

  /**
   * Starts an upload. A refusal is reported here rather than thrown: a drop is
   * accepted anywhere in the window and has no caller waiting to catch anything, and
   * swallowing it is what made a failed drop look like nothing happening at all.
   */
  const start = useCallback(async (paths: string[]) => {
    if (paths.length === 0) return;
    setError("");
    try {
      // The record as it stands before this drop is added to it. Read rather than
      // assumed: reloading the window throws away this side's copy of it and not the
      // sidecar's, and the poll below measures against this to know what is new.
      latest.current = await rpc<UploadStatus>("uploadStatus").catch(() => latest.current);
      // Windows is asked about every video in the drop before the upload starts, because
      // the sidecar thumbnails with a still-image library and a video defeats it, and a
      // length exists only once something has opened the container. Both come off one
      // shell item per file. Both ways in come through here, so a dropped folder and a
      // picked file get the same treatment. A refusal is swallowed rather than raised:
      // the upload is what was asked for, and a video with neither thumbnail nor length
      // is exactly what shipped before this call existed.
      const prep = await invoke<FramePrep>("upload_frames", { paths }).catch(
        (): FramePrep => ({ frames: {}, media: {} }),
      );
      await rpc("startUpload", { paths, frames: prep.frames, media: prep.media });
      setPolling(true);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  // Native drag and drop, window-wide. Paths, never bytes, cross the boundary.
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let disposed = false;

    getCurrentWebview()
      .onDragDropEvent((event) => {
        const p = event.payload;
        if (p.type === "over") setDragging(true);
        else if (p.type === "leave") setDragging(false);
        else if (p.type === "drop") {
          setDragging(false);
          void start(p.paths);
        }
      })
      .then((stop) => {
        if (disposed) stop();
        else unlisten = stop;
      })
      .catch(() => {});

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [start]);

  // RPC is request/response, so progress is polled rather than pushed.
  useEffect(() => {
    if (!polling) return;
    // What the record already held when this drop was accepted. The sidecar appends to
    // one running record rather than starting a fresh one, so a drop that finished
    // earlier is still sitting in it, and without this the first reading of the new
    // drop would read as a completed one and end the poll before anything had begun.
    const before = latest.current;
    let sawRunning = false;
    let idlePolls = 0;

    const id = setInterval(async () => {
      try {
        const next = await rpc<UploadStatus>("uploadStatus");
        latest.current = next;
        setStatus(next);
        if (next.running) {
          sawRunning = true;
          return;
        }

        // Three ways a drop is over, and it takes all three. The stopped edge is the
        // ordinary one, and the only one that can end a cancel, which strands the items
        // that never ran. A single small file, or a selection that turns out to be all
        // duplicates, is finished before the first reading and is never once seen
        // running, so it is the record having moved that says so. And a drop holding
        // nothing uploadable is never acknowledged at all, so a record that never moves
        // is eventually taken to mean exactly that.
        const stopped = sawRunning;
        const moved = settledIn(next) !== settledIn(before) || next.total !== before.total;
        const nothingCame = ++idlePolls >= IDLE_GIVE_UP_MS / POLL_MS;

        if (stopped || moved || nothingCame) {
          setPolling(false);
          if (next.done > before.done) onFinished(); // refresh the grid once, at the end
        }
      } catch {
        /* a single failed poll is not fatal */
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [polling, onFinished]);

  const cancel = useCallback(() => {
    void rpc("cancelUpload").catch(() => {});
  }, []);

  const clear = useCallback(async () => {
    await rpc("clearUploads").catch(() => {});
    setStatus(EMPTY);
    latest.current = EMPTY;
    setError("");
    // Clearing the queue leaves nothing to report, so the poll goes with it. Resetting
    // the status alone left it running against a record that would never move again.
    setPolling(false);
  }, []);

  const settled = settledIn(status);

  return {
    status,
    dragging,
    error,
    start,
    cancel,
    clear,
    running: status.running,
    progressLabel: status.total > 0 ? `${settled}/${status.total}` : "",
  };
}
