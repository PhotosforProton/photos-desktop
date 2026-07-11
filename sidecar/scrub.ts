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

// Redact anything shaped like account key material from a string before it can
// reach the on-disk log: PGP armor blocks, and long base64 / hex runs (armored
// key bodies, session keys, tokens, passphrases). Extracted into its own module
// so it can be unit-tested without server.ts's stdio side effects.
export function scrubSecrets(s: string): string {
  return s
    .replace(/-----BEGIN [\s\S]*?-----END[^-]*-----/g, "[redacted PGP block]")
    .replace(/[A-Za-z0-9+/]{40,}={0,2}/g, "[redacted]")
    .replace(/\b[0-9a-fA-F]{40,}\b/g, "[redacted]");
}
