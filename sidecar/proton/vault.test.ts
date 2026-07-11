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
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initStore, isReady } from "./store";
import { createVault, unlockVault, vaultExists, lockVault } from "./vault";

// Point the store (and therefore vault.json) at a throwaway temp directory.
beforeAll(() => {
  initStore(mkdtempSync(join(tmpdir(), "pfp-vault-")));
});

describe("vault (scrypt password gate)", () => {
  const pw = "correct horse battery staple";

  it("unlocks with the right password after a lock", () => {
    createVault(pw);
    expect(vaultExists()).toBe(true);
    expect(isReady()).toBe(true);
    lockVault();
    expect(isReady()).toBe(false);
    expect(unlockVault(pw)).toBe(true);
    expect(isReady()).toBe(true);
  });

  it("rejects a wrong password and sets no key", () => {
    lockVault();
    expect(unlockVault("not the password")).toBe(false);
    expect(isReady()).toBe(false);
  });
});
