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

import { describe, it, expect } from "vitest";
import { scrubSecrets } from "./scrub.ts";

describe("scrubSecrets", () => {
  it("redacts a PGP armored key block", () => {
    const s =
      "decrypt failed:\n-----BEGIN PGP PRIVATE KEY BLOCK-----\nVersion: OpenPGP\n\nlQdGBGaB3xQBEACxyz1234567890abcdefGHIJKLmnop/qrstuvwXYZ+0123456789\nAAAABBBBCCCCDDDDEEEEFFFF0000111122223333=\n-----END PGP PRIVATE KEY BLOCK-----\ndone";
    const out = scrubSecrets(s);
    expect(out).not.toContain("BEGIN PGP");
    expect(out).toContain("[redacted PGP block]");
    expect(out).toContain("done");
  });

  it("redacts a long base64 run (session key / token / passphrase)", () => {
    const s =
      "[console.info] userKeyPassphrase: TW9yZVNlY3JldEtleU1hdGVyaWFsQmFzZTY0RW5jb2RlZFN0dWZmSGVyZTEyMzQ1Njc4OTA=";
    const out = scrubSecrets(s);
    expect(out).toContain("[redacted]");
    expect(out).not.toMatch(/[A-Za-z0-9+/]{40,}/);
  });

  it("redacts a long hex run (raw session key)", () => {
    const s = "sessionKey=9f8e7d6c5b4a39281706f5e4d3c2b1a0ffeeddccbbaa99887766554433221100 algo=aes256";
    const out = scrubSecrets(s);
    expect(out).toContain("[redacted]");
    expect(out).toContain("algo=aes256");
  });

  it("leaves a normal diagnostic line untouched", () => {
    const s = "[sidecar] getTimeline done, 924 items in 812ms";
    expect(scrubSecrets(s)).toBe(s);
  });
});
