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

import { describe, it, expect, beforeAll } from "vitest";
import { randomBytes } from "node:crypto";
import { setDataKey, seal, unseal } from "./store.ts";

// seal/unseal only need the AES data key (not a directory), so a random 32-byte
// key stands in for the vault-derived one.
beforeAll(() => setDataKey(randomBytes(32)));

describe("store seal/unseal (AES-256-GCM)", () => {
  it("round-trips arbitrary bytes", () => {
    const data = Buffer.from("session tokens + key passphrases", "utf8");
    expect(unseal(seal(data)).equals(data)).toBe(true);
  });

  it("produces a fresh nonce each time (no ciphertext reuse)", () => {
    const data = Buffer.from("same plaintext");
    expect(seal(data).equals(seal(data))).toBe(false);
  });

  it("rejects a tampered blob (GCM auth failure)", () => {
    const blob = seal(Buffer.from("secret"));
    blob[blob.length - 1] ^= 0xff; // flip a tag byte
    expect(() => unseal(blob)).toThrow();
  });

  it("rejects a truncated blob", () => {
    expect(() => unseal(Buffer.alloc(8))).toThrow(/truncated/);
  });
});
