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

import { invoke } from "@tauri-apps/api/core";

type RpcEnvelope = { ok: boolean; result?: unknown; error?: string };

// Transport-level errors from the Rust host (not sidecar business errors).
// When they happen (e.g. the sidecar was restarted after a code change), retry once.
const CONNECTION_ERROR = /sidecar closed|write to sidecar|flush to sidecar|sidecar task/i;

/** Call a sidecar method through the Rust host and unwrap the {ok,result,error} envelope. */
export async function rpc<T = unknown>(
  method: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const resp = (await invoke("rpc", { method, params })) as RpcEnvelope;
      if (!resp || typeof resp !== "object") throw new Error("Empty sidecar response");
      if (!resp.ok) throw new Error(resp.error || "Sidecar error");
      return resp.result as T;
    } catch (e) {
      lastErr = e;
      if (attempt === 0 && CONNECTION_ERROR.test(String(e))) continue;
      throw e;
    }
  }
  throw lastErr;
}
