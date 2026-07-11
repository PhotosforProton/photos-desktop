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

// The app-owned encrypted store.
//
// The AES-256-GCM data key is derived from the user's Proton password by the
// vault (vault.ts) and set on unlock; it never reaches disk and never leaves
// this process. Everything written here lands inside the app's own directory.
//
// Blob layout: nonce(12) || ciphertext || tag(16).

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const NONCE_LEN = 12;
const TAG_LEN = 16;

let dataDir: string | null = null;
let dataKey: Buffer | null = null;

export function initStore(dir: string): void {
  dataDir = dir;
  mkdirSync(thumbDir(), { recursive: true });
}

/** The vault sets the data key once it is derived from the password. */
export function setDataKey(key: Buffer): void {
  if (key.length !== 32) throw new Error("data key must be 32 bytes");
  dataKey = key;
}

/** Forget the key; the store stays locked until the next unlock. */
export function clearDataKey(): void {
  if (dataKey) dataKey.fill(0);
  dataKey = null;
}

export function storeDir(): string {
  if (!dataDir) throw new Error("store not initialised");
  return dataDir;
}

export function isReady(): boolean {
  return dataDir !== null && dataKey !== null;
}

function thumbDir(): string {
  if (!dataDir) throw new Error("store not initialised");
  return join(dataDir, "thumbs");
}

/** Drop the whole thumbnail cache; used when the vault key changes. */
export function wipeCache(): void {
  if (!dataDir) return;
  try {
    rmSync(thumbDir(), { recursive: true, force: true });
    mkdirSync(thumbDir(), { recursive: true });
  } catch {
    /* best-effort */
  }
}

export function seal(plain: Buffer): Buffer {
  if (!dataKey) throw new Error("store not initialised");
  const nonce = randomBytes(NONCE_LEN);
  const c = createCipheriv("aes-256-gcm", dataKey, nonce);
  const ciphertext = Buffer.concat([c.update(plain), c.final()]);
  return Buffer.concat([nonce, ciphertext, c.getAuthTag()]);
}

export function unseal(blob: Buffer): Buffer {
  if (!dataKey) throw new Error("store not initialised");
  if (blob.length <= NONCE_LEN + TAG_LEN) throw new Error("blob truncated");
  const nonce = blob.subarray(0, NONCE_LEN);
  const tag = blob.subarray(blob.length - TAG_LEN);
  const ciphertext = blob.subarray(NONCE_LEN, blob.length - TAG_LEN);
  const d = createDecipheriv("aes-256-gcm", dataKey, nonce);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ciphertext), d.final()]);
}

/** Content-addressed file name; the uid never appears in the clear on disk. */
function thumbPath(uid: string, type: number): string {
  const name = createHash("sha256").update(`${uid}:${type}`).digest("hex");
  return join(thumbDir(), `${name}.bin`);
}

/** Cached decrypted thumbnail bytes, or null on a miss / unreadable entry. */
export function thumbGet(uid: string, type: number): Buffer | null {
  if (!isReady()) return null;
  const path = thumbPath(uid, type);
  if (!existsSync(path)) return null;
  try {
    return unseal(readFileSync(path));
  } catch {
    return null; // tampered or written under a previous key
  }
}

export function thumbPut(uid: string, type: number, data: Buffer): void {
  if (!isReady()) return;
  try {
    writeFileSync(thumbPath(uid, type), seal(data));
  } catch {
    /* caching is best-effort; never fail a request over it */
  }
}

/** Search-index metadata (name + media type), content-addressed and encrypted. */
type NodeMetaBlob = { name: string; mediaType: string | null };

function metaPath(uid: string): string {
  const name = createHash("sha256").update(`meta:${uid}`).digest("hex");
  return join(dataDir!, "meta", `${name}.bin`);
}

export function metaGet(uid: string): NodeMetaBlob | null {
  if (!isReady()) return null;
  const path = metaPath(uid);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(unseal(readFileSync(path)).toString("utf8")) as NodeMetaBlob;
  } catch {
    return null; // tampered or written under a previous key
  }
}

export function metaPut(uid: string, meta: NodeMetaBlob): void {
  if (!isReady()) return;
  try {
    mkdirSync(join(dataDir!, "meta"), { recursive: true });
    writeFileSync(metaPath(uid), seal(Buffer.from(JSON.stringify(meta))));
  } catch {
    /* best-effort */
  }
}
