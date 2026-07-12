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

// The authenticated Proton session: SRP login, key unlock, and the Photos
// client. Holds state across the login -> 2FA -> browse steps.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { randomUUID } from "node:crypto";
import { createWriteStream, existsSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WritableStream } from "node:stream/web";

import { MemoryCache, ThumbnailType } from "@protontech/drive-sdk";
import { ProtonDrivePhotosClient } from "@protontech/drive-sdk/dist/protonDrivePhotosClient.js";

import { CryptoProxy, initCrypto, makeOpenPGPCryptoModule, srpModule, getSrp } from "./crypto.ts";
import {
  ProtonApi,
  captchaUrl,
  makeSdkHttpClient,
  refreshSession,
  type HvProof,
  type Session,
} from "./api.ts";
import {
  isReady,
  metaGet,
  metaPut,
  seal,
  storeDir,
  thumbGet,
  thumbPut,
  unseal,
  wipeCache,
} from "./store.ts";
import { lockVault, openOrResetVault, unlockVault, vaultExists } from "./vault.ts";
import {
  cancelUpload as abortUpload,
  clearFinishedUploads as clearUploads,
  getUploadStatus as readUploadStatus,
  startUpload as runUpload,
  type UploadStatus,
} from "./upload.ts";

// The signed-in Proton session, encrypted at rest with the vault key. Only a
// correct password can derive that key, so this file is unreadable without it.
const SESSION_FILE = "session.enc";
// The vault verifier/salt file (must match vault.ts META_FILE). Removed on
// sign-out so the account is fully forgotten.
const VAULT_META_FILE = "vault.json";

// Cap for in-memory video playback. A larger file would strain the sidecar heap
// and the JSON-RPC channel, so past it the app offers a download instead.
const MAX_INMEMORY_VIDEO = 150 * 1024 * 1024;

/** A destination filename in `dir` that does not overwrite an existing file. */
function uniqueFileName(dir: string, name: string): string {
  if (!existsSync(join(dir, name))) return name;
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  for (let i = 2; i < 10000; i++) {
    const candidate = `${stem} (${i})${ext}`;
    if (!existsSync(join(dir, candidate))) return candidate;
  }
  return `${stem}-${Date.now()}${ext}`;
}

const toDataUrl = (bytes: Buffer): string => `data:image/jpeg;base64,${bytes.toString("base64")}`;

const toMillis = (value: unknown): number => (value ? new Date(value as string).getTime() : 0);

/**
 * `NodeEntity.name` is a `Result<string, Error | InvalidNameError>`. An invalid
 * name still carries a placeholder the client is meant to display.
 */
function nodeName(node: any): string {
  const result = node?.name;
  if (!result) return "";
  if (result.ok) return String(result.value);
  const placeholder = result.error?.name;
  return typeof placeholder === "string" ? placeholder : "";
}

type AlbumSummary = {
  uid: string;
  name: string;
  photoCount: number;
  coverUid: string | null;
  lastActivityTime: number;
};

type SharedSummary = {
  uid: string;
  name: string;
  type: string;
  mediaType: string | null;
  isShared: boolean;
  isSharedPublicly: boolean;
  captureTime: number | null;
};

type NodeMeta = { uid: string; name: string; mediaType: string | null };

type LoginResult =
  | { status: "ok"; email: string }
  | { status: "2fa" }
  /** The API demands human verification; `url` is the captcha page to embed. */
  | { status: "hv"; url: string }
  | { status: "error"; error: string };

type AccountAddress = {
  email: string;
  addressId: string;
  primaryKeyIndex: number;
  keys: { id: string; key: any }[];
};

/**
 * What we persist (encrypted) so a cold start can resume without a full re-login.
 * It carries the derived key passphrases, mirroring the SDK's own session-secret
 * cache. The account password itself is never part of this.
 */
type PersistableSession = {
  uid: string;
  accessToken: string;
  refreshToken: string;
  username: string;
  userKeyPassphrases: Record<string, string>;
};

/** Whether the app has a saved account, and (only while unlocked) whose. */
type LockStatus = { hasVault: boolean; unlocked: boolean; email: string | null };

export class ProtonSession {
  private session: Session | null = null;
  private username = "";
  private email = "";
  private password = "";
  /** Derived key passphrases by user key id. Persisted in place of the password. */
  private userKeyPassphrases: Record<string, string> = {};
  private photos: any = null;

  async login(username: string, password: string): Promise<LoginResult> {
    initCrypto();
    this.username = username;
    this.password = password;
    this.userKeyPassphrases = {};
    return this.authenticate();
  }

  /**
   * The SRP handshake. A 9001 means the API wants human verification, so the
   * caller gets a captcha URL to embed and replays this through
   * `submitCaptcha`. The handshake is redone from scratch on that retry, so a
   * spent SRP session is never replayed.
   */
  private async authenticate(hv?: HvProof): Promise<LoginResult> {
    const { username, password } = this;

    const info: any = await ProtonApi.authInfo(username);
    const proofs = await getSrp(
      {
        Version: info.Version,
        Modulus: info.Modulus,
        ServerEphemeral: info.ServerEphemeral,
        Salt: info.Salt,
        Username: username,
      } as any,
      { username, password },
      info.Version,
    );

    let auth: any;
    try {
      auth = await ProtonApi.auth(
        {
          Username: username,
          ClientEphemeral: proofs.clientEphemeral,
          ClientProof: proofs.clientProof,
          SRPSession: info.SRPSession,
        },
        hv,
      );
    } catch (e: any) {
      if (e?.hv) {
        const methods: string[] = e.hv.methods ?? [];
        process.stderr.write(`[sidecar] human verification required (methods: ${methods.join(",")})\n`);
        if (methods.length > 0 && !methods.includes("captcha")) {
          const list = methods.join(" or ");
          return { status: "error", error: `This sign-in needs ${list} verification, which this app cannot show yet.` };
        }
        return { status: "hv", url: captchaUrl(e.hv.token) };
      }
      return { status: "error", error: (e as Error).message };
    }

    if (auth.ServerProof !== proofs.expectedServerProof) {
      return { status: "error", error: "Server proof mismatch (do not trust this session)" };
    }

    this.session = { uid: auth.UID, accessToken: auth.AccessToken, refreshToken: auth.RefreshToken };

    const twoFa = auth["2FA"]?.Enabled ?? 0;
    if (twoFa & 1) {
      return { status: "2fa" };
    }
    return this.finishLogin();
  }

  /** Replay the sign-in with the token the embedded captcha page produced. */
  async submitCaptcha(token: string): Promise<LoginResult> {
    if (!this.password) return { status: "error", error: "No sign-in is in progress" };
    return this.authenticate({ token, type: "captcha" });
  }

  async submit2fa(code: string): Promise<LoginResult> {
    if (!this.session) return { status: "error", error: "No session in progress" };
    await ProtonApi.auth2fa(this.session, code);
    return this.finishLogin();
  }

  /**
   * The live session inside this sidecar process. A WebView reload throws away
   * the UI but not this process, so the app can pick the session back up without
   * spending the stored refresh token.
   */
  whoami(): { email: string } | null {
    return this.photos && this.email ? { email: this.email } : null;
  }

  /**
   * Account identity and Drive storage use, for the avatar and profile menu.
   * Proton reports Drive-specific space separately on newer plans, so prefer it
   * and fall back to the account-wide figures.
   */
  async getAccountInfo(): Promise<{
    email: string;
    displayName: string;
    initial: string;
    usedSpace: number;
    maxSpace: number;
  }> {
    if (!this.session) throw new Error("Not signed in");
    const res: any = await ProtonApi.getUser(this.session);
    const user = res.User ?? {};

    const used = Number(user.UsedDriveSpace) || Number(user.UsedSpace) || 0;
    const max = Number(user.MaxDriveSpace) || Number(user.MaxSpace) || 0;
    const displayName: string = user.DisplayName || user.Name || this.email || this.username;

    return {
      email: this.email || user.Email || "",
      displayName,
      initial: (displayName.trim()[0] ?? "?").toUpperCase(),
      usedSpace: used,
      maxSpace: max,
    };
  }

  /**
   * Whether a saved account exists and whether it is unlocked in this process.
   * A cold start reports `hasVault: true, unlocked: false`; the UI then shows the
   * lock screen. The email is only known once unlocked, so it stays null before.
   */
  lockStatus(): LockStatus {
    const unlocked = isReady();
    return {
      hasVault: vaultExists(),
      unlocked,
      email: unlocked && this.email ? this.email : null,
    };
  }

  /**
   * Cold-start unlock: derive the vault key from the password, decrypt the saved
   * session, resume it, and unlock the Proton keys with the same password. A
   * wrong password sets no key and reveals nothing (see `unlockVault`).
   */
  async unlock(password: string): Promise<LoginResult> {
    if (!vaultExists()) return { status: "error", error: "No saved account" };
    if (!unlockVault(password)) return { status: "error", error: "wrong password" };

    try {
      const path = join(storeDir(), SESSION_FILE);
      if (!existsSync(path)) {
        lockVault();
        return { status: "error", error: "No saved session" };
      }
      const blob = JSON.parse(unseal(readFileSync(path)).toString("utf8")) as PersistableSession;
      let result = await this.resumeSession(blob, password);
      if (result.status !== "ok") {
        // The stored tokens are dead (e.g. the refresh token expired), but the
        // vault opened, so the password is correct. Fall back to a fresh SRP
        // login for new tokens, keeping the vault key and the cache intact.
        this.username = blob.username;
        this.password = password;
        this.userKeyPassphrases = {};
        result = await this.authenticate();
      }
      // Only a hard failure relocks; an in-progress hv/2fa keeps the unlocked
      // vault so the follow-up step can persist the freshly issued session.
      if (result.status === "error") {
        this.lock();
      }
      return result;
    } catch (e) {
      this.lock();
      return { status: "error", error: (e as Error).message };
    }
  }

  /** Drop the in-memory session and forget the vault key; the next use needs an unlock. */
  lock(): { ok: boolean } {
    lockVault();
    this.session = null;
    this.photos = null;
    this.email = "";
    this.password = "";
    this.userKeyPassphrases = {};
    return { ok: true };
  }

  /** Forget the account entirely: relock, then delete the saved session, the vault, and the cache. */
  signOut(): { ok: boolean } {
    this.lock();
    try {
      rmSync(join(storeDir(), SESSION_FILE), { force: true });
      rmSync(join(storeDir(), VAULT_META_FILE), { force: true });
    } catch (e) {
      process.stderr.write(`[sidecar] signOut cleanup failed: ${(e as Error).message}\n`);
    }
    wipeCache();
    return { ok: true };
  }

  /**
   * Write the current session to disk, encrypted with the vault key. Called on a
   * fresh sign-in and again on every token refresh, so a rotated refresh token is
   * never lost. A no-op while the vault is locked (nothing to seal with).
   */
  private persistSession(): void {
    if (!isReady()) return;
    const blob = this.getPersistable();
    if (!blob) return;
    try {
      writeFileSync(join(storeDir(), SESSION_FILE), seal(Buffer.from(JSON.stringify(blob))));
    } catch (e) {
      process.stderr.write(`[sidecar] could not persist session: ${(e as Error).message}\n`);
    }
  }

  /** Restore a stored session (refreshes the token, then rebuilds the client). */
  async resume(blob: PersistableSession): Promise<LoginResult> {
    return this.resumeSession(blob, "");
  }

  /**
   * Shared resume path. `password`, when supplied by `unlock`, lets `buildAccount`
   * re-derive the Proton key passphrases the same way a fresh sign-in does, so the
   * keys unlock even if the cached passphrases are absent. It is never persisted.
   */
  private async resumeSession(blob: PersistableSession, password: string): Promise<LoginResult> {
    initCrypto();
    try {
      const fresh = await refreshSession(blob.uid, blob.refreshToken);
      this.session = fresh;
      this.username = blob.username;
      this.password = password;
      this.userKeyPassphrases = blob.userKeyPassphrases ?? {};
      return this.finishLogin();
    } catch (e) {
      return { status: "error", error: `resume failed: ${(e as Error).message}` };
    }
  }

  /**
   * The blob the host persists into the encrypted app store. It carries the
   * derived key passphrases, mirroring the SDK's own session-secret cache. The
   * account password itself is never written anywhere.
   */
  getPersistable(): PersistableSession | null {
    if (!this.session) return null;
    return {
      uid: this.session.uid,
      accessToken: this.session.accessToken,
      refreshToken: this.session.refreshToken ?? "",
      username: this.username,
      userKeyPassphrases: this.userKeyPassphrases,
    };
  }

  private async finishLogin(): Promise<LoginResult> {
    // Capture the password before `buildAccount` clears it: a fresh sign-in needs
    // it to derive the vault key. Resume/unlock arrive with the vault already open.
    const password = this.password;
    try {
      const account = await this.buildAccount();
      this.photos = new ProtonDrivePhotosClient({
        httpClient: makeSdkHttpClient(this.session!, () => this.persistSession()),
        entitiesCache: new MemoryCache(),
        cryptoCache: new MemoryCache(),
        account,
        openPGPCryptoModule: makeOpenPGPCryptoModule(),
        srpModule,
        // Silent telemetry. The SDK otherwise logs every API path and node UID
        // through `getLogger`, and could hand metrics (which carry node UIDs) to
        // `recordMetric`. No-ops keep all of that off disk and off the network.
        telemetry: {
          getLogger: () => ({ debug() {}, info() {}, warn() {}, error() {} }),
          recordMetric: () => {},
        },
      } as any);
      const primary = await account.getOwnPrimaryAddress();
      this.email = primary.email;
      // Fresh sign-in: derive the vault key from the just-verified password. It
      // is not re-run when unlock already opened the vault (avoids a second scrypt).
      if (password && !isReady()) openOrResetVault(password);
      // Persist the session (rotated refresh token included) whenever the vault is
      // open, so a cold start can resume without a full re-login.
      if (isReady()) this.persistSession();
      return { status: "ok", email: primary.email };
    } catch (e) {
      return { status: "error", error: (e as Error).message };
    }
  }

  private async buildAccount() {
    const s = this.session!;
    const password = this.password;

    const [userRes, addrRes, saltRes] = await Promise.all([
      ProtonApi.getUser(s),
      ProtonApi.getAddresses(s),
      ProtonApi.getKeySalts(s),
    ]);

    const user: any = (userRes as any).User ?? {};
    const addresses: any[] = ((addrRes as any).Addresses ?? []).slice().sort((a: any, b: any) => a.Order - b.Order);
    const salts: any[] = (saltRes as any).KeySalts ?? [];
    const saltById = new Map<string, string>(salts.map((x: any) => [x.ID, x.KeySalt]));

    // Unlock the user's private keys, either from a remembered passphrase (resume)
    // or by deriving it from the mailbox password (fresh sign-in).
    const userKeys: any[] = [];
    for (const uk of user.Keys ?? []) {
      let passphrase = this.userKeyPassphrases[uk.ID];
      if (!passphrase) {
        const salt = saltById.get(uk.ID);
        if (!salt || !password) continue;
        passphrase = await srpModule.computeKeyPassword(password, salt);
      }
      try {
        userKeys.push(await CryptoProxy.importPrivateKey({ armoredKey: uk.PrivateKey, passphrase } as any));
        this.userKeyPassphrases[uk.ID] = passphrase;
      } catch {
        delete this.userKeyPassphrases[uk.ID];
      }
    }
    if (userKeys.length === 0) {
      throw new Error("Could not unlock your account keys (wrong password, or two-password mode?)");
    }
    // The password has served its purpose; only the derived passphrases are kept.
    this.password = "";

    // Unlock each address key: its Token is a message encrypted to the user key.
    const accountAddresses: AccountAddress[] = [];
    for (const addr of addresses) {
      if (addr.Status !== 1) continue;
      const keys: { id: string; key: any }[] = [];
      let primaryKeyIndex = 0;
      for (const ak of addr.Keys ?? []) {
        try {
          let passphrase: string;
          if (ak.Token) {
            const dec: any = await CryptoProxy.decryptMessage({
              armoredMessage: ak.Token,
              decryptionKeys: userKeys,
              format: "utf8",
            } as any);
            passphrase = dec.data;
          } else {
            const salt = saltById.get(ak.ID);
            passphrase = salt ? await srpModule.computeKeyPassword(password, salt) : password;
          }
          const key = await CryptoProxy.importPrivateKey({ armoredKey: ak.PrivateKey, passphrase } as any);
          keys.push({ id: ak.ID, key });
          if (ak.Primary === 1) primaryKeyIndex = keys.length - 1;
        } catch {
          /* skip this key */
        }
      }
      if (keys.length > 0) {
        accountAddresses.push({ email: addr.Email, addressId: addr.ID, primaryKeyIndex, keys });
      }
    }
    if (accountAddresses.length === 0) {
      throw new Error("Could not unlock any address keys");
    }

    // Verification keys are looked up per address and cached for the session.
    const publicKeyCache = new Map<string, any[]>();

    const fetchPublicKeys = async (email: string): Promise<any[]> => {
      const res: any = await ProtonApi.getAddressPublicKeys(s, email);
      const armored = [...(res?.Address?.Keys ?? []), ...(res?.CatchAll?.Keys ?? [])]
        .map((k: any) => k?.PublicKey)
        .filter((k: unknown): k is string => typeof k === "string" && k.length > 0);
      return Promise.all(
        armored.map((armoredKey) => CryptoProxy.importPublicKey({ armoredKey } as any)),
      );
    };

    // The ProtonDriveAccount contract the SDK consumes.
    return {
      getOwnPrimaryAddress: async () => accountAddresses[0],
      getOwnAddresses: async () => accountAddresses,
      getOwnAddress: async (emailOrId: string) => {
        const a = accountAddresses.find((x) => x.email === emailOrId || x.addressId === emailOrId);
        if (!a) throw new Error(`No address for ${emailOrId}`);
        return a;
      },
      hasProtonAccount: async () => true,
      /**
       * Verification keys for an address. A lookup failure degrades to "cannot
       * verify" rather than blocking a photo from rendering, which is how the
       * SDK already treats signature verification: best-effort, non-fatal.
       */
      getPublicKeys: async (email: string, forceRefresh = false): Promise<any[]> => {
        const key = email.toLowerCase();
        if (!forceRefresh && publicKeyCache.has(key)) return publicKeyCache.get(key)!;
        try {
          const keys = await fetchPublicKeys(email);
          publicKeyCache.set(key, keys);
          return keys;
        } catch (e) {
          process.stderr.write(`[sidecar] getPublicKeys failed: ${(e as Error).message}\n`);
          return [];
        }
      },
    };
  }

  async getTimeline(): Promise<{ uid: string; captureTime: number; tags: number[] }[]> {
    // Verbose timeline tracing is disabled: it kept node UIDs (e.g. the photos
    // root id) in sidecar.log. Flip to stderr.write only for local debugging.
    const log = (_m: string) => {};
    log(`photos ${this.photos ? "set" : "NULL"}`);
    if (!this.photos) throw new Error("Not signed in");
    const out: { uid: string; captureTime: number; tags: number[] }[] = [];
    try {
      log("raw photos-share API check ...");
      const rawShare = await ProtonApi.photosShare(this.session!).catch((e: Error) => {
        log(`raw photos-share FAILED: ${e.message}`);
        return null;
      });
      if (rawShare) log(`raw photos-share ok: keys=${Object.keys(rawShare).join(",")}`);
      log("resolving photos root (SDK) ...");
      const root = await this.photos.getMyPhotosRootFolder();
      log(`photos root ok: ${(root as any)?.uid ?? "?"}`);
      log("starting timeline iteration ...");
      for await (const item of this.photos.iterateTimeline()) {
        if (out.length === 0) log("first timeline item received");
        const uid = (item as any).uid ?? (item as any).nodeUid;
        const ct = (item as any).captureTime;
        const captureTime = ct instanceof Date ? ct.getTime() : Number(ct) * 1000;
        out.push({ uid, captureTime, tags: ((item as any).tags ?? []) as number[] });
        // Sanity ceiling only, to bound one runaway response; realistic libraries
        // stay well under it. Reaching it is logged, so it can never be a silent
        // truncation like the old 3000 cap.
        if (out.length >= 200000) {
          log("WARNING: timeline hit the 200000 ceiling, truncating");
          break;
        }
      }
      log(`done, ${out.length} items`);
    } catch (e) {
      log(`ERROR: ${(e as Error).stack ?? String(e)}`);
      throw e;
    }
    return out;
  }

  /** Grid thumbnails, served from the encrypted on-disk cache when present. */
  async getThumbnails(uids: string[]): Promise<{ uid: string; dataUrl: string | null }[]> {
    if (!this.photos) throw new Error("Not signed in");
    const out: { uid: string; dataUrl: string | null }[] = [];
    const missing: string[] = [];

    for (const uid of uids) {
      const cached = thumbGet(uid, ThumbnailType.Type1);
      if (cached) out.push({ uid, dataUrl: toDataUrl(cached) });
      else missing.push(uid);
    }
    if (missing.length === 0) return out;

    for await (const r of this.photos.iterateThumbnails(missing, ThumbnailType.Type1)) {
      const uid = (r as any).nodeUid;
      if ((r as any).ok) {
        const bytes = Buffer.from((r as any).thumbnail);
        thumbPut(uid, ThumbnailType.Type1, bytes);
        out.push({ uid, dataUrl: toDataUrl(bytes) });
      } else {
        out.push({ uid, dataUrl: null });
      }
    }
    return out;
  }

  /** HD preview (Type2 thumbnail) for the image viewer / lightbox. */
  async getPreview(uid: string): Promise<string | null> {
    if (!this.photos) throw new Error("Not signed in");
    const cached = thumbGet(uid, ThumbnailType.Type2);
    if (cached) return toDataUrl(cached);

    for await (const r of this.photos.iterateThumbnails([uid], ThumbnailType.Type2)) {
      if ((r as any).ok) {
        const bytes = Buffer.from((r as any).thumbnail);
        thumbPut(uid, ThumbnailType.Type2, bytes);
        return toDataUrl(bytes);
      }
      return null;
    }
    return null;
  }

  // ---- Full-file download: in-memory video playback, and save-to-folder ----

  /**
   * Full video bytes for in-app playback, kept in memory and returned as base64
   * so nothing decrypted is written to disk. Bounded by a size cap: a very large
   * file would strain the sidecar heap and the JSON-RPC channel, so past the cap
   * the caller is told to download the file instead.
   */
  async getVideo(uid: string): Promise<{ base64: string; mime: string }> {
    if (!this.photos) throw new Error("Not signed in");
    const node = await this.photos.getNode(uid);
    const mime = (node as any).mediaType || "video/mp4";
    const downloader = await this.photos.getFileDownloader(uid);
    const claimed = downloader.getClaimedSizeInBytes?.() ?? 0;
    if (claimed && claimed > MAX_INMEMORY_VIDEO) throw new Error("VIDEO_TOO_LARGE");

    const chunks: Uint8Array[] = [];
    let total = 0;
    const stream = new WritableStream<Uint8Array>({
      write(chunk) {
        total += chunk.byteLength;
        if (total > MAX_INMEMORY_VIDEO) throw new Error("VIDEO_TOO_LARGE");
        chunks.push(chunk);
      },
    });
    await downloader.downloadToStream(stream as any).completion();
    return { base64: Buffer.concat(chunks).toString("base64"), mime };
  }

  private mountUids: { uid: string; captureTime: number }[] | null = null;

  /**
   * One page of cloud photos as {uid, name, size, captureTime} for the Explorer
   * mount. `offset === 0` (re)builds the lightweight uid list once (a single cheap
   * timeline pass); later pages slice it. The claimed size (needed so hydration
   * transfers exactly that many bytes) lives on the node revision, so `getNode` is
   * per photo — paging lets the Rust host release the RPC lock between pages, so
   * the app's thumbnails keep loading while the mount populates.
   */
  async listForMount(
    offset: number,
    limit: number,
  ): Promise<{
    items: { uid: string; name: string; size: number; captureTime: number }[];
    total: number;
  }> {
    if (!this.photos) throw new Error("Not signed in");
    if (offset === 0 || !this.mountUids) {
      const picks: { uid: string; captureTime: number }[] = [];
      for await (const item of this.photos.iterateTimeline()) {
        const uid = (item as any).nodeUid ?? (item as any).uid;
        if (!uid) continue;
        const ct = (item as any).captureTime;
        picks.push({ uid, captureTime: ct instanceof Date ? ct.getTime() : Number(ct) * 1000 });
      }
      this.mountUids = picks;
    }

    const items: { uid: string; name: string; size: number; captureTime: number }[] = [];
    for (const p of this.mountUids.slice(offset, offset + limit)) {
      try {
        const n: any = await this.photos.getNode(p.uid);
        const revision = n.activeRevision?.ok ? n.activeRevision.value : null;
        const size = Number(revision?.claimedSize ?? 0);
        if (size > 0) {
          items.push({ uid: p.uid, name: nodeName(n) || p.uid, size, captureTime: p.captureTime });
        }
      } catch {
        /* a node that vanished server-side is skipped */
      }
    }
    return { items, total: this.mountUids.length };
  }

  /**
   * Stream one file's decrypted bytes to a temp file on disk and return its path,
   * for the host to transfer into the Explorer placeholder in small chunks. The full
   * file is never resident in memory: buffering it (plus a base64 copy for the RPC)
   * needed several times the file size at once, so a run of large videos starved the
   * single-threaded sidecar and stalled the whole app. Streaming keeps memory flat,
   * so there is also no size cap. The host deletes the temp file after the transfer.
   */
  async hydrateFile(uid: string): Promise<{ path: string; size: number }> {
    if (!this.photos) throw new Error("Not signed in");
    const dest = join(tmpdir(), `pfp-hyd-${randomUUID()}.bin`);
    const downloader = await this.photos.getFileDownloader(uid);
    const file = createWriteStream(dest);
    let total = 0;
    const stream = new WritableStream<Uint8Array>({
      write(chunk) {
        total += chunk.byteLength;
        // Respect backpressure so a large file cannot balloon the write buffer.
        if (!file.write(chunk)) {
          return new Promise<void>((resolve) => file.once("drain", resolve));
        }
      },
      abort() {
        file.destroy();
      },
    });
    try {
      await downloader.downloadToStream(stream as any).completion();
      // Close ourselves and wait for the flush; end(cb) cannot hang the way waiting
      // on the SDK to call the stream's close() could (which froze the serial RPC).
      await new Promise<void>((resolve, reject) => {
        file.end((err?: Error | null) => (err ? reject(err) : resolve()));
      });
    } catch (e) {
      file.destroy();
      try {
        rmSync(dest, { force: true });
      } catch {
        /* a cleanup failure must not mask the original error */
      }
      throw e;
    }
    return { path: dest, size: total };
  }

  /**
   * Download the originals for the given photos straight to a folder the user
   * picked. The decrypted files are written out and the app does not track them
   * afterwards. Per-file result; the run continues past a single failure, and a
   * partial file from a failed download is removed.
   */
  async downloadOriginals(
    uids: string[],
    destDir: string,
  ): Promise<{ uid: string; ok: boolean; name?: string; error?: string }[]> {
    if (!this.photos) throw new Error("Not signed in");
    const out: { uid: string; ok: boolean; name?: string; error?: string }[] = [];
    for (const uid of uids) {
      let dest: string | null = null;
      try {
        const node = await this.photos.getNode(uid);
        const name = uniqueFileName(destDir, nodeName(node) || uid);
        dest = join(destDir, name);
        const downloader = await this.photos.getFileDownloader(uid);
        const file = createWriteStream(dest);
        const stream = new WritableStream<Uint8Array>({
          write(chunk) {
            // Synchronous write like the video path; respect backpressure so a large
            // file does not balloon the buffer.
            if (!file.write(chunk)) {
              return new Promise<void>((resolve) => file.once("drain", resolve));
            }
          },
          abort() {
            file.destroy();
          },
        });
        await downloader.downloadToStream(stream as any).completion();
        // Close the file ourselves and wait for the flush. Waiting on the SDK to
        // call the stream's close() (as the old code did via finished()) could hang
        // forever and, since RPC is serialized, froze the whole app; end(cb) cannot.
        await new Promise<void>((resolve, reject) => {
          file.end((err?: Error | null) => (err ? reject(err) : resolve()));
        });
        // Stamp the file with the photo's original capture time so Explorer shows
        // the real date, not the moment it was downloaded.
        const whenMs =
          toMillis((node as any).photo?.captureTime) || toMillis((node as any).creationTime);
        if (whenMs > 0) {
          try {
            utimesSync(dest, new Date(whenMs), new Date(whenMs));
          } catch {
            /* a timestamp failure must not fail the download */
          }
        }
        out.push({ uid, ok: true, name });
      } catch (e) {
        if (dest) {
          try {
            rmSync(dest, { force: true });
          } catch {
            /* ignore */
          }
        }
        out.push({ uid, ok: false, error: (e as Error).message });
      }
    }
    return out;
  }

  // ---- Albums (entirely SDK-backed: iterateAlbums / iterateAlbum) ----

  /** Albums, most recently active first. The SDK yields them as nodes of type "album". */
  async getAlbums(): Promise<AlbumSummary[]> {
    if (!this.photos) throw new Error("Not signed in");
    const out: AlbumSummary[] = [];
    for await (const node of this.photos.iterateAlbums()) {
      const album = (node as any).album;
      out.push({
        uid: (node as any).uid,
        name: nodeName(node),
        photoCount: album?.photoCount ?? 0,
        coverUid: album?.coverPhotoNodeUid ?? null,
        lastActivityTime: toMillis(album?.lastActivityTime),
      });
    }
    out.sort((a, b) => b.lastActivityTime - a.lastActivityTime);
    return out;
  }

  /**
   * Every photo uid that belongs to at least one album.
   *
   * Android keeps a join table for this because a photo's parent is the photos
   * root, not the album. The SDK gives us the same edges through `iterateAlbum`,
   * so we walk the albums once and collect the membership.
   */
  async getAlbumPhotoUids(): Promise<string[]> {
    if (!this.photos) throw new Error("Not signed in");
    const albumUids: string[] = [];
    for await (const album of this.photos.iterateAlbums()) {
      albumUids.push((album as any).uid);
    }

    const members = new Set<string>();
    for (const albumUid of albumUids) {
      try {
        for await (const item of this.photos.iterateAlbum(albumUid)) {
          members.add((item as any).nodeUid);
        }
      } catch (e) {
        process.stderr.write(`[sidecar] iterateAlbum(${albumUid}) failed: ${(e as Error).message}\n`);
      }
    }
    return [...members];
  }

  /** The photos inside one album, newest first. */
  async getAlbumPhotos(uid: string): Promise<{ uid: string; captureTime: number }[]> {
    if (!this.photos) throw new Error("Not signed in");
    const out: { uid: string; captureTime: number }[] = [];
    for await (const item of this.photos.iterateAlbum(uid)) {
      out.push({ uid: (item as any).nodeUid, captureTime: toMillis((item as any).captureTime) });
    }
    out.sort((a, b) => b.captureTime - a.captureTime);
    return out;
  }

  /**
   * Albums with their member photo uids, for the Explorer mount's `Albums\`
   * subfolders. Names and sizes are not resolved here — the mount reuses the
   * metadata gathered in the main photo pass — so this stays a cheap membership
   * walk (iterateAlbums, then iterateAlbum per album).
   */
  async listAlbumsForMount(): Promise<{ uid: string; name: string; uids: string[] }[]> {
    if (!this.photos) throw new Error("Not signed in");
    const out: { uid: string; name: string; uids: string[] }[] = [];
    for await (const albumNode of this.photos.iterateAlbums()) {
      const albumUid = (albumNode as any).uid;
      const uids: string[] = [];
      try {
        for await (const item of this.photos.iterateAlbum(albumUid)) {
          const u = (item as any).nodeUid;
          if (u) uids.push(u);
        }
      } catch (e) {
        process.stderr.write(`[sidecar] iterateAlbum(${albumUid}) failed: ${(e as Error).message}\n`);
      }
      out.push({ uid: albumUid, name: nodeName(albumNode) || "Album", uids });
    }
    return out;
  }

  // ---- Sharing (SDK: iterateSharedNodes / iterateSharedNodesWithMe) ----

  /** What I share out (`withMe: false`) or what others shared with me (`withMe: true`). */
  async getShared(withMe: boolean): Promise<SharedSummary[]> {
    if (!this.photos) throw new Error("Not signed in");
    const nodes = withMe
      ? this.photos.iterateSharedNodesWithMe()
      : this.photos.iterateSharedNodes();

    const out: SharedSummary[] = [];
    for await (const node of nodes) {
      const n = node as any;
      out.push({
        uid: n.uid,
        name: nodeName(n),
        type: n.type,
        mediaType: n.mediaType ?? null,
        isShared: !!n.isShared,
        isSharedPublicly: !!n.isSharedPublicly,
        captureTime: n.photo?.captureTime ? toMillis(n.photo.captureTime) : null,
      });
    }
    return out;
  }

  // ---- Search index ----

  /**
   * Names and media types for the search index. The SDK has no server-side
   * search, so the client filters locally; this feeds it. `iterateNodes`
   * batches the lookups, so callers may pass large uid chunks.
   */
  async getMetadata(uids: string[]): Promise<NodeMeta[]> {
    if (!this.photos) throw new Error("Not signed in");
    const out: NodeMeta[] = [];
    const missing: string[] = [];

    // Names decrypt once, then come from the encrypted on-disk cache, so opening
    // search never re-indexes the whole library on later sessions.
    for (const uid of uids) {
      const cached = metaGet(uid);
      if (cached) out.push({ uid, name: cached.name, mediaType: cached.mediaType });
      else missing.push(uid);
    }
    if (missing.length === 0) return out;

    for await (const node of this.photos.iterateNodes(missing)) {
      const n = node as any;
      if (n.missingUid) continue; // node vanished server-side
      const meta = { name: nodeName(n), mediaType: n.mediaType ?? null };
      metaPut(n.uid, meta);
      out.push({ uid: n.uid, name: meta.name, mediaType: meta.mediaType });
    }
    return out;
  }

  // ---- Upload ----

  /** Kicks the job off and returns at once; the UI polls `uploadStatus`. */
  startUpload(paths: string[]): { started: boolean } {
    if (!this.photos) throw new Error("Not signed in");
    runUpload(this.photos, paths);
    return { started: true };
  }

  uploadStatus(): UploadStatus {
    return readUploadStatus();
  }

  cancelUpload(): { cancelled: boolean } {
    abortUpload();
    return { cancelled: true };
  }

  clearUploads(): { cleared: boolean } {
    clearUploads();
    return { cleared: true };
  }

  // ---- Single-photo actions (SDK: getNode / renameNode / trashNodes) ----

  /** Everything the details panel shows. Size and hashes live on the revision. */
  async getNodeDetails(uid: string): Promise<Record<string, unknown>> {
    if (!this.photos) throw new Error("Not signed in");
    const n: any = await this.photos.getNode(uid);
    const revision = n.activeRevision?.ok ? n.activeRevision.value : null;

    return {
      uid: n.uid,
      name: nodeName(n),
      type: n.type,
      mediaType: n.mediaType ?? null,
      captureTime: n.photo?.captureTime ? toMillis(n.photo.captureTime) : null,
      creationTime: toMillis(n.creationTime),
      modificationTime: revision?.claimedModificationTime
        ? toMillis(revision.claimedModificationTime)
        : null,
      size: revision?.claimedSize ?? null,
      storageSize: revision?.storageSize ?? n.totalStorageSize ?? null,
      sha1: revision?.claimedDigests?.sha1 ?? null,
      sha1Verified: revision?.claimedDigests?.sha1Verified ?? null,
      extra: revision?.claimedAdditionalMetadata ?? null,
      tags: n.photo?.tags ?? [],
      albumCount: (n.photo?.albums ?? []).length,
      isShared: !!n.isShared,
      isSharedPublicly: !!n.isSharedPublicly,
      owner: n.ownedBy?.email ?? null,
    };
  }

  async renamePhoto(uid: string, newName: string): Promise<{ uid: string; name: string }> {
    if (!this.photos) throw new Error("Not signed in");
    const n: any = await this.photos.renameNode(uid, newName);
    return { uid: n.uid, name: nodeName(n) };
  }

  /** Moves photos to the trash. The SDK reports per-node results. */
  async trashPhotos(uids: string[]): Promise<{ uid: string; ok: boolean; error?: string }[]> {
    if (!this.photos) throw new Error("Not signed in");
    const out: { uid: string; ok: boolean; error?: string }[] = [];
    for await (const r of this.photos.trashNodes(uids)) {
      const result = r as any;
      out.push(
        result.ok
          ? { uid: result.uid, ok: true }
          : { uid: result.uid, ok: false, error: String(result.error?.message ?? result.error) },
      );
    }
    return out;
  }
}

export const session = new ProtonSession();
