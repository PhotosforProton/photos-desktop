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

// Node sidecar: hosts the official Proton Drive TypeScript SDK and answers
// requests from the Tauri Rust host over newline-delimited JSON-RPC (stdin/stdout).
//
// Request  : {"id": number, "method": string, "params"?: any}
// Response : {"id": number, "ok": true, "result": any} | {"id": number, "ok": false, "error": string}
//
// stdout carries ONLY JSON responses. Diagnostics go to stderr.

// Polyfill Uint8Array base64/hex methods (core-js), used by @protontech/crypto.
import "@protontech/crypto/polyfill";
import { VERSION } from "@protontech/drive-sdk";
import { session } from "./proton/session.ts";
import { initStore } from "./proton/store.ts";
import { scrubSecrets } from "./scrub.ts";
import { checkUpdate, downloadUpdate } from "./update.ts";

// Two hard rules for the sidecar's output. (1) stdout carries ONLY JSON-RPC
// responses; a stray write corrupts the channel and knocks the sidecar offline.
// (2) sidecar.log (the packaged build's stderr) must NEVER hold account key
// material: the SDK and openpgp log through console.*, and their output or an
// error stack can carry armored keys, passphrases or session keys.
const RELEASE = process.env.SIDECAR_RELEASE === "1";

// Single choke point for the log: everything written to stderr (our own
// diagnostics from every module, the crash handlers, and the dev console echo)
// is scrubbed first, so a library that embeds a key in an error can never leak
// it to disk.
const rawStderrWrite = process.stderr.write.bind(process.stderr);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(process.stderr as any).write = (chunk: any, ...rest: any[]) =>
  rawStderrWrite(typeof chunk === "string" ? scrubSecrets(chunk) : chunk, ...rest);

// Library console.* is kept OFF both channels: never stdout, and in the packaged
// build never the log either. It lands in a small in-memory ring (not persisted,
// not exposed); dev echoes it to the console for visibility.
const consoleRing: string[] = [];
for (const method of ["log", "info", "debug", "warn", "trace", "error"] as const) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (console as any)[method] = (...args: unknown[]) => {
    const line = scrubSecrets(`[console.${method}] ${args.map((a) => String(a)).join(" ")}`);
    consoleRing.push(line);
    if (consoleRing.length > 200) consoleRing.shift();
    if (!RELEASE) rawStderrWrite(line + "\n"); // dev visibility only; never persisted in the packaged app
  };
}

// Keep the sidecar alive on stray async errors from background SDK tasks, so a
// single rejection can't silently drop the authenticated session. Written via
// the scrubbing stderr wrap above.
process.on("unhandledRejection", (reason) => {
  process.stderr.write(
    `[sidecar] unhandledRejection: ${reason instanceof Error ? (reason.stack ?? reason.message) : String(reason)}\n`,
  );
});
process.on("uncaughtException", (err) => {
  process.stderr.write(`[sidecar] uncaughtException: ${err.stack ?? String(err)}\n`);
});

type Request = { id: number; method: string; params?: any };

const handlers: Record<string, (params: any) => Promise<unknown> | unknown> = {
  // Sent by the Rust host before anything else: the app directory. The store's
  // data key is not passed here; it is derived from the user's password by the
  // vault on unlock, so the cache and session stay sealed until then.
  __init: (p) => {
    initStore(p.dataDir);
    return { store: "ready" };
  },
  ping: () => ({ sdkVersion: VERSION, node: process.version }),
  login: (p) => session.login(p.username, p.password),
  submitCaptcha: (p) => session.submitCaptcha(p.token),
  submit2fa: (p) => session.submit2fa(p.code),
  lockStatus: () => session.lockStatus(),
  unlock: (p) => session.unlock(p.password),
  lock: () => session.lock(),
  getTimeline: () => session.getTimeline(),
  getThumbnails: (p) => session.getThumbnails(p.uids),
  getPreview: (p) => session.getPreview(p.uid),
  getVideo: (p) => session.getVideo(p.uid),
  downloadOriginals: (p) => session.downloadOriginals(p.uids, p.destDir),
  listForMount: (p) => session.listForMount(p.offset ?? 0, p.limit ?? 50),
  hydrateFile: (p) => session.hydrateFile(p.uid),
  heapStats: () => process.memoryUsage(),
  getAlbums: () => session.getAlbums(),
  getAlbumPhotos: (p) => session.getAlbumPhotos(p.uid),
  getAlbumPhotoUids: () => session.getAlbumPhotoUids(),
  listAlbumsForMount: () => session.listAlbumsForMount(),
  getShared: (p) => session.getShared(!!p.withMe),
  getMetadata: (p) => session.getMetadata(p.uids),
  startUpload: (p) => session.startUpload(p.paths),
  uploadStatus: () => session.uploadStatus(),
  cancelUpload: () => session.cancelUpload(),
  clearUploads: () => session.clearUploads(),
  getNodeDetails: (p) => session.getNodeDetails(p.uid),
  renamePhoto: (p) => session.renamePhoto(p.uid, p.name),
  trashPhotos: (p) => session.trashPhotos(p.uids),
  resume: (p) => session.resume(p),
  whoami: () => session.whoami(),
  getAccountInfo: () => session.getAccountInfo(),
  signOut: () => session.signOut(),
  getPersistable: () => session.getPersistable(),
  checkUpdate: () => checkUpdate(),
  downloadUpdate: (p) => downloadUpdate(p.url, p.sha256),
};

async function handle(req: Request): Promise<unknown> {
  const handler = handlers[req.method];
  if (!handler) {
    return { id: req.id, ok: false, error: `unknown method: ${req.method}` };
  }
  try {
    const result = await handler(req.params ?? {});
    return { id: req.id, ok: true, result };
  } catch (e) {
    return { id: req.id, ok: false, error: (e as Error).message ?? String(e) };
  }
}

function send(obj: unknown): void {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

process.stderr.write("[sidecar] ready\n");
let buf = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buf += chunk;
  let nl: number;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let req: Request;
    try {
      req = JSON.parse(line) as Request;
    } catch {
      send({ id: null, ok: false, error: "invalid JSON request" });
      continue;
    }
    void handle(req).then(send);
  }
});
process.stdin.on("end", () => process.exit(0));
