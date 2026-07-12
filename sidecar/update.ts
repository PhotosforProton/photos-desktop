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

// App self-update: read the GitHub releases of this repo, and download the
// installer with a SHA-256 check. The Rust host then runs it in `--update` mode.
// The repo is public, so no auth. `/releases/latest` skips prereleases, so the
// full list is read and the newest release that ships an .exe wins.

import { createHash } from "node:crypto";
import { createWriteStream, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const REPO = "PhotosforProton/photos-desktop";
const UA = { "User-Agent": "PhotosForProton-Updater" };

export type UpdateInfo = {
  tag: string;
  version: string; // tag without a leading "v"
  notes: string;
  url: string;
  sha256: string | null; // hex, from the GitHub asset digest
  size: number;
} | null;

/** The newest published release (prereleases included) that ships an installer. */
export async function checkUpdate(): Promise<UpdateInfo> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=15`, {
    headers: { Accept: "application/vnd.github+json", ...UA },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const releases = (await res.json()) as any[];

  let best: { r: any; asset: any } | null = null;
  for (const r of releases) {
    if (r.draft) continue;
    const asset = (r.assets ?? []).find((a: any) => String(a.name).toLowerCase().endsWith(".exe"));
    if (!asset) continue;
    if (!best || new Date(r.published_at).getTime() > new Date(best.r.published_at).getTime()) {
      best = { r, asset };
    }
  }
  if (!best) return null;

  const digest: string = best.asset.digest ?? ""; // "sha256:<hex>"
  return {
    tag: best.r.tag_name,
    version: String(best.r.tag_name).replace(/^v/i, ""),
    notes: best.r.body ?? "",
    url: best.asset.browser_download_url,
    sha256: digest.startsWith("sha256:") ? digest.slice(7) : null,
    size: best.asset.size ?? 0,
  };
}

/** Download the installer to a temp file and verify its SHA-256; returns the path. */
export async function downloadUpdate(url: string, sha256: string | null): Promise<string> {
  const res = await fetch(url, { headers: UA, redirect: "follow" });
  if (!res.ok || !res.body) throw new Error(`download ${res.status}`);

  const dest = join(tmpdir(), `pfp-update-${process.pid}.exe`);
  await pipeline(Readable.fromWeb(res.body as any), createWriteStream(dest));

  if (sha256) {
    const got = createHash("sha256").update(await readFile(dest)).digest("hex");
    if (got.toLowerCase() !== sha256.toLowerCase()) {
      try {
        rmSync(dest, { force: true });
      } catch {
        /* ignore */
      }
      throw new Error("HASH_MISMATCH");
    }
  }
  return dest;
}
