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

// Password-derived vault key.
//
// The local data key is derived from the user's Proton password with scrypt, so
// the encrypted cache and the stored session cannot be opened without it. This
// replaces the Windows DPAPI seal: it is stronger (knowledge-gated, not merely
// scoped to the OS account) and cross-platform (no Windows-only API), matching
// how Proton itself derives keys from the mailbox password.
//
// Design: dataKey = scrypt(password, salt). A password change (rare) yields a
// different key; the old cache/session become unreadable and are recreated on
// the next sign-in. The meta file stores only the salt and a hash of the key as
// a verifier, which reveals nothing about the key itself.

import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { clearDataKey, setDataKey, storeDir, wipeCache } from "./store";

// ~64 MiB of work per derivation: strong for an interactive unlock, still snappy.
const SCRYPT: import("node:crypto").ScryptOptions = {
  N: 1 << 16,
  r: 8,
  p: 1,
  maxmem: 128 * 1024 * 1024,
};
const KEY_LEN = 32;
const SALT_LEN = 16;
const META_FILE = "vault.json";

type VaultMeta = { v: 1; salt: string; verifier: string };

function metaPath(): string {
  return join(storeDir(), META_FILE);
}

export function vaultExists(): boolean {
  return existsSync(metaPath());
}

function derive(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, KEY_LEN, SCRYPT);
}

// A preimage-resistant tag over the key: lets us check a password without ever
// storing the key or anything that could reconstruct it.
function verifierFor(key: Buffer): Buffer {
  return createHash("sha256").update(key).update("photos-for-proton/vault").digest();
}

/** Start a fresh vault for this password (first sign-in, or after a password change). */
export function createVault(password: string): void {
  const salt = randomBytes(SALT_LEN);
  const key = derive(password, salt);
  const meta: VaultMeta = {
    v: 1,
    salt: salt.toString("base64"),
    verifier: verifierFor(key).toString("base64"),
  };
  writeFileSync(metaPath(), JSON.stringify(meta));
  setDataKey(key);
}

/** Unlock an existing vault. Returns false (without touching the key) on a wrong password. */
export function unlockVault(password: string): boolean {
  if (!vaultExists()) return false;
  const meta = JSON.parse(readFileSync(metaPath(), "utf8")) as VaultMeta;
  const key = derive(password, Buffer.from(meta.salt, "base64"));
  const got = verifierFor(key);
  const want = Buffer.from(meta.verifier, "base64");
  if (got.length !== want.length || !timingSafeEqual(got, want)) {
    key.fill(0);
    return false;
  }
  setDataKey(key);
  return true;
}

/**
 * Sign-in path (the Proton password was just validated by SRP). Unlock the
 * existing vault if the password still matches; otherwise the password changed,
 * so drop the now-unreadable cache and start a clean vault.
 */
export function openOrResetVault(password: string): void {
  if (unlockVault(password)) return;
  wipeCache();
  createVault(password);
}

/** Forget the in-memory key (sign-out, or tray lock when "always ask" is on). */
export function lockVault(): void {
  clearDataKey();
}
