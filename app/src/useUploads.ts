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
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { rpc } from "./rpc";

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

const EMPTY: UploadStatus = { running: false, total: 0, done: 0, skipped: 0, failed: 0, items: [] };

/**
 * Owns uploading for the whole window: a drop anywhere is accepted, progress is
 * polled, and a second drop while one is running simply appends to the queue.
 */
export function useUploads(onFinished: () => void) {
  const [status, setStatus] = useState<UploadStatus>(EMPTY);
  const [dragging, setDragging] = useState(false);
  const [polling, setPolling] = useState(false);
  const wasRunning = useRef(false);

  const start = useCallback(async (paths: string[]) => {
    if (paths.length === 0) return;
    await rpc("startUpload", { paths });
    setPolling(true);
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
    const id = setInterval(async () => {
      try {
        const next = await rpc<UploadStatus>("uploadStatus");
        setStatus(next);

        if (wasRunning.current && !next.running) {
          setPolling(false);
          if (next.done > 0) onFinished(); // refresh the grid once, at the end
        }
        wasRunning.current = next.running;
      } catch {
        /* a single failed poll is not fatal */
      }
    }, 400);
    return () => clearInterval(id);
  }, [polling, onFinished]);

  const cancel = useCallback(() => {
    void rpc("cancelUpload").catch(() => {});
  }, []);

  const clear = useCallback(async () => {
    await rpc("clearUploads").catch(() => {});
    setStatus(EMPTY);
    wasRunning.current = false;
  }, []);

  const inFlight = status.done + status.skipped + status.failed;

  return {
    status,
    dragging,
    start,
    cancel,
    clear,
    running: status.running,
    progressLabel: status.total > 0 ? `${inFlight}/${status.total}` : "",
  };
}
