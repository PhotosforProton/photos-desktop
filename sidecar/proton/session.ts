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

import { rmSync } from "node:fs";
import { join } from "node:path";

import { MemoryCache, PhotoTag, ThumbnailType } from "@protontech/drive-sdk";
import { ProtonDrivePhotosClient } from "@protontech/drive-sdk/dist/protonDrivePhotosClient.js";

import {
  CryptoProxy,
  computeKeyPassword,
  initCrypto,
  makeOpenPGPCryptoModule,
  makeSrpModule,
  getSrp,
} from "./crypto.ts";
import {
  ProtonApi,
  captchaUrl,
  makeSdkHttpClient,
  randomModulus,
  refreshSession,
  type HvProof,
  type Session,
} from "./api.ts";
import {
  SESSION_FILE,
  isReady,
  metaGet,
  metaPut,
  readSealedOrDiscard,
  storeDir,
  thumbGet,
  thumbPut,
  wipeCache,
  writeSealedAtomic,
} from "./store.ts";
import { lockVault, openOrResetVault, unlockVault, vaultExists } from "./vault.ts";
import { nodeDurationMs, nodeName, toMillis } from "./nodes.ts";
import {
  getOriginal as readOriginal,
  getSaveStatus as readSaveStatus,
  getVideo as readVideo,
  hydrateFile as runHydrateFile,
  listForMount as readMountPage,
  readOriginalBytes as takeOriginalBytes,
  releaseOriginal as dropOriginal,
  resetDownloadState,
  resolveDurationsBatch,
  resolveMediaTypesBatch,
  startSaveOriginals as runSaveOriginals,
  type HydratedFile,
  type MountPage,
  type OriginalStatus,
  type SaveStatus,
  type VideoBytes,
} from "./download.ts";
import {
  offlineStatus as readOfflineStatus,
  pinOffline as runPinOffline,
  resetOfflineState,
  unpinAllOffline as runUnpinAllOffline,
  unpinOffline as runUnpinOffline,
  type OfflineStatus,
} from "./offline.ts";
import {
  cancelUpload as abortUpload,
  clearFinishedUploads as clearUploads,
  getUploadStatus as readUploadStatus,
  startUpload as runUpload,
  type ShellMediaInfo,
  type UploadStatus,
} from "./upload.ts";
import {
  deletePhotosForever as runDeleteForever,
  emptyTrash as runEmptyTrash,
  listTrashed as readTrash,
  restorePhotos as runRestore,
  type TrashItem,
  type TrashResult,
} from "./trash.ts";
import {
  getSharingInfo as readSharingInfo,
  invitePeople as runInvitePeople,
  removePerson as runRemovePerson,
  removePublicLink as runRemovePublicLink,
  setPublicLink as runSetPublicLink,
  stopSharing as runStopSharing,
  type PublicLinkOptions,
  type SharingInfo,
} from "./sharing.ts";
import {
  addPhotosToAlbum as runAddToAlbum,
  createAlbum as runCreateAlbum,
  deleteAlbum as runDeleteAlbum,
  listAlbumPhotoUids as readAlbumPhotoUids,
  listAlbumPhotos as readAlbumPhotos,
  listAlbums as readAlbums,
  listAlbumsForMount as readAlbumsForMount,
  removePhotosFromAlbum as runRemoveFromAlbum,
  renameAlbum as runRenameAlbum,
  setAlbumCover as runSetAlbumCover,
  type AlbumMount,
  type AlbumPhoto,
  type AlbumResult,
  type AlbumSummary,
  type DeleteAlbumOutcome,
} from "./albums.ts";

// The signed-in Proton session is sealed with the vault key, so it is named by the
// store: `wipeCache` has to take it along when that key changes.
//
// The vault verifier/salt file (must match vault.ts META_FILE). Removed on
// sign-out so the account is fully forgotten.
const VAULT_META_FILE = "vault.json";
// Mount state the Rust host keeps in this same directory (names must match
// cloud_mount.rs). Sealed there under the host's own key, but still per-account,
// so sign-out takes it with the rest: left behind, one account's uid list makes
// every photo in the next one look new, which is a whole-library download.
const HOST_STATE_FILES = ["mount_seen.txt", "synced_albums.txt"];
// What an internal-only key lookup answers for an address with no Proton account.
const NO_SUCH_PROTON_ADDRESS = 33102;

const toDataUrl = (bytes: Buffer): string => `data:image/jpeg;base64,${bytes.toString("base64")}`;

type SharedSummary = {
  uid: string;
  name: string;
  type: string;
  mediaType: string | null;
  isShared: boolean;
  isSharedPublicly: boolean;
  captureTime: number | null;
  /**
   * The album fields, null on a photo. A shared album is an album first and a
   * shared thing second, so it gets the same three facts the albums screen shows:
   * without them it can only be drawn as a bare tile.
   *
   * The cover uid is stamped with the owner's volume, not the reader's, which is
   * what makes it resolvable at all from here.
   */
  coverUid: string | null;
  photoCount: number | null;
  lastActivityTime: number | null;
};

type NodeMeta = { uid: string; name: string; mediaType: string | null; size?: number | null };

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
      // A blob that will not open is no more recoverable than one that is not there, so
      // it is answered the same way: the password has just been proved correct, and this
      // must not look like a wrong one. `readSealedOrDiscard` drops it, leaving the vault
      // and every cached photo intact and asking only for a sign-in. Surfacing the crypto
      // error instead fails identically on every retry, and the one way out of that is
      // the one that wipes every original the user pinned.
      const path = join(storeDir(), SESSION_FILE);
      const raw = readSealedOrDiscard(path);
      let blob: PersistableSession | null = null;
      if (raw) {
        try {
          blob = JSON.parse(raw.toString("utf8")) as PersistableSession;
        } catch {
          rmSync(path, { force: true }); // opened, but is not the shape we wrote
        }
      }
      if (!blob) {
        lockVault();
        return { status: "error", error: "No saved session" };
      }
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
    // The mount listing is this account's photo uids and capture times. Drop it
    // with everything else: leaving it would let a listing for the NEXT account
    // be served from the previous one's snapshot.
    resetDownloadState();
    // Same for the offline list: it is sealed with the key we just forgot, so the
    // in-memory copy must go too. The stored originals stay for this account to
    // come back to; sign-out is what removes those, through wipeCache.
    resetOfflineState();
    return { ok: true };
  }

  /** Forget the account entirely: relock, then delete the saved session, the vault, and the cache. */
  signOut(): { ok: boolean } {
    this.lock();
    try {
      rmSync(join(storeDir(), SESSION_FILE), { force: true });
      rmSync(join(storeDir(), VAULT_META_FILE), { force: true });
      // The host's mount state lives in this same directory and is plaintext:
      // the auto-download baseline is a list of this account's photo uids, and
      // the album list is what it chose to keep offline. Neither survives the
      // account it belongs to.
      for (const f of HOST_STATE_FILES) {
        rmSync(join(storeDir(), f), { force: true });
      }
    } catch (e) {
      // Code only: a Node fs error message embeds the full path, and these paths
      // carry the Windows account name.
      process.stderr.write(
        `[sidecar] signOut cleanup failed: ${(e as NodeJS.ErrnoException).code ?? "unknown"}\n`,
      );
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
      // Written aside and renamed rather than in place: this runs on every token
      // refresh, so a write torn by a crash would leave an unreadable session behind
      // on an ordinary day of use.
      writeSealedAtomic(join(storeDir(), SESSION_FILE), Buffer.from(JSON.stringify(blob)));
    } catch (e) {
      process.stderr.write(
        `[sidecar] could not persist session: ${(e as NodeJS.ErrnoException).code ?? "unknown"}\n`,
      );
    }
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
   * The blob `persistSession` seals into the encrypted app store. It carries the
   * derived key passphrases, mirroring the SDK's own session-secret cache. The
   * account password itself is never written anywhere. Private on purpose: these
   * are the tokens and the passphrases that unlock the Proton private keys, so
   * they must never be reachable over the RPC channel.
   */
  private getPersistable(): PersistableSession | null {
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
        // Read per call, so a token refresh (which rewrites the session in
        // place) is picked up without rebuilding the client.
        srpModule: makeSrpModule(async () => {
          if (!this.session) throw new Error("Not signed in");
          return randomModulus(this.session);
        }),
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
        passphrase = await computeKeyPassword(password, salt);
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
            passphrase = salt ? await computeKeyPassword(password, salt) : password;
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
      // `InternalOnly=1` keeps the lookup inside Proton's own directory, which is
      // what makes an empty answer mean "no Proton account" rather than "no keys
      // published anywhere".
      const res: any = await ProtonApi.getAddressPublicKeys(s, email);
      const armored = [...(res?.Address?.Keys ?? []), ...(res?.CatchAll?.Keys ?? [])]
        .map((k: any) => k?.PublicKey)
        .filter((k: unknown): k is string => typeof k === "string" && k.length > 0);
      return Promise.all(
        armored.map((armoredKey) => CryptoProxy.importPublicKey({ armoredKey } as any)),
      );
    };

    /**
     * An address's Proton keys, cached for the session. Two callers depend on it:
     * signature verification, where a lookup failure degrades to "cannot verify"
     * rather than blocking a photo from rendering, and `hasProtonAccount`, where
     * an empty list is the answer itself.
     */
    const getPublicKeys = async (email: string, forceRefresh = false): Promise<any[]> => {
      const key = email.toLowerCase();
      if (!forceRefresh && publicKeyCache.has(key)) return publicKeyCache.get(key)!;
      try {
        const keys = await fetchPublicKeys(email);
        publicKeyCache.set(key, keys);
        return keys;
      } catch (e) {
        // An address with no Proton account answers 33102, which is an answer and
        // not a fault, so it is not worth a line. Anything else is, but only its
        // status: the API's wording quotes the address, and that never goes to
        // the log.
        const err = e as { status?: number; code?: number };
        if (err.code !== NO_SUCH_PROTON_ADDRESS) {
          process.stderr.write(
            `[sidecar] getPublicKeys failed (status ${err.status ?? "?"}, code ${err.code ?? "?"})\n`,
          );
        }
        return [];
      }
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
      /**
       * Whether an address can be invited as a Proton user. The SDK asks before
       * sharing and sends one of two invitations on the answer: an encrypted one
       * to a Proton account's keys, or a signed external one to an address
       * without them. Answering a blanket "yes" would send every non-Proton
       * invitee down the encrypted path, which has no key to encrypt to.
       */
      hasProtonAccount: async (email: string) => (await getPublicKeys(email)).length > 0,
      getPublicKeys: (email: string, forceRefresh = false) => getPublicKeys(email, forceRefresh),
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

  // ---- Download ----

  async getVideo(uid: string): Promise<VideoBytes> {
    if (!this.photos) throw new Error("Not signed in");
    return readVideo(this.photos, uid);
  }

  /** Kicks the save off and returns at once; the UI polls `saveStatus`. */
  startSaveOriginals(uids: string[], destDir: string): { started: boolean } {
    if (!this.photos) throw new Error("Not signed in");
    runSaveOriginals(this.photos, uids, destDir);
    return { started: true };
  }

  saveStatus(): SaveStatus {
    return readSaveStatus();
  }

  async listForMount(offset: number, limit: number): Promise<MountPage> {
    if (!this.photos) throw new Error("Not signed in");
    return readMountPage(this.photos, offset, limit);
  }

  async hydrateFile(uid: string): Promise<HydratedFile> {
    if (!this.photos) throw new Error("Not signed in");
    return runHydrateFile(this.photos, uid);
  }

  /**
   * The viewer's full-resolution upgrade: starts the transfer on the first call for a
   * photo and reports it on every later one, so the viewer polls this single method.
   */
  async getOriginal(uid: string): Promise<OriginalStatus> {
    if (!this.photos) throw new Error("Not signed in");
    return readOriginal(this.photos, uid);
  }

  /** Drop the staged original once the viewer steps away from it or closes. */
  releaseOriginal(uid?: string): { released: true } {
    dropOriginal(uid);
    return { released: true };
  }

  /**
   * The bytes behind an in-memory original, for the host to serve. Nothing but the
   * host's own protocol handler calls this, and only for the token it was just given.
   */
  readOriginalBytes(token: string): { base64: string; mime: string } | null {
    return takeOriginalBytes(token);
  }

  // ---- Available offline (see offline.ts) ----

  /** Mark photos as available offline; the fetch runs in the background. */
  pinOffline(uids: string[]): OfflineStatus {
    if (!this.photos) throw new Error("Not signed in");
    return runPinOffline(this.photos, uids);
  }

  /** Unmark photos and reclaim the space their originals held. */
  unpinOffline(uids: string[]): OfflineStatus {
    return runUnpinOffline(uids);
  }

  /** The Settings panel's "free up" for offline photos: all of them at once. */
  unpinAllOffline(): OfflineStatus {
    return runUnpinAllOffline();
  }

  /** What is pinned, how much of it has landed, and what it costs. */
  offlineStatus(): OfflineStatus {
    return readOfflineStatus();
  }

  // ---- Albums (see albums.ts) ----

  async getAlbums(): Promise<AlbumSummary[]> {
    if (!this.photos) throw new Error("Not signed in");
    return readAlbums(this.photos);
  }

  async getAlbumPhotoUids(): Promise<string[]> {
    if (!this.photos) throw new Error("Not signed in");
    return readAlbumPhotoUids(this.photos);
  }

  async getAlbumPhotos(uid: string): Promise<AlbumPhoto[]> {
    if (!this.photos) throw new Error("Not signed in");
    return readAlbumPhotos(this.photos, uid);
  }

  async listAlbumsForMount(): Promise<AlbumMount[]> {
    if (!this.photos) throw new Error("Not signed in");
    return readAlbumsForMount(this.photos);
  }

  async createAlbum(name: string): Promise<AlbumSummary> {
    if (!this.photos) throw new Error("Not signed in");
    return runCreateAlbum(this.photos, name);
  }

  async renameAlbum(uid: string, name: string): Promise<{ uid: string; name: string }> {
    if (!this.photos) throw new Error("Not signed in");
    return runRenameAlbum(this.photos, uid, name);
  }

  async setAlbumCover(uid: string, coverUid: string): Promise<{ uid: string; coverUid: string }> {
    if (!this.photos) throw new Error("Not signed in");
    return runSetAlbumCover(this.photos, uid, coverUid);
  }

  async deleteAlbum(
    uid: string,
    options: { force?: boolean; saveToTimeline?: boolean },
  ): Promise<DeleteAlbumOutcome> {
    if (!this.photos) throw new Error("Not signed in");
    return runDeleteAlbum(this.photos, uid, options);
  }

  async addPhotosToAlbum(albumUid: string, uids: string[]): Promise<AlbumResult[]> {
    if (!this.photos) throw new Error("Not signed in");
    return runAddToAlbum(this.photos, albumUid, uids);
  }

  async removePhotosFromAlbum(albumUid: string, uids: string[]): Promise<AlbumResult[]> {
    if (!this.photos) throw new Error("Not signed in");
    return runRemoveFromAlbum(this.photos, albumUid, uids);
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
        coverUid: n.album?.coverPhotoNodeUid ?? null,
        photoCount: n.album?.photoCount ?? null,
        lastActivityTime: n.album?.lastActivityTime ? toMillis(n.album.lastActivityTime) : null,
      });
    }
    return out;
  }

  // ---- Sharing a node out (SDK: getSharingInfo / shareNode / unshareNode) ----

  async getSharingInfo(uid: string): Promise<SharingInfo> {
    if (!this.photos) throw new Error("Not signed in");
    return readSharingInfo(this.photos, uid);
  }

  async setPublicLink(uid: string, options?: PublicLinkOptions): Promise<SharingInfo> {
    if (!this.photos) throw new Error("Not signed in");
    return runSetPublicLink(this.photos, uid, options);
  }

  async removePublicLink(uid: string): Promise<SharingInfo> {
    if (!this.photos) throw new Error("Not signed in");
    return runRemovePublicLink(this.photos, uid);
  }

  async invitePeople(uid: string, emails: string[], role: string): Promise<SharingInfo> {
    if (!this.photos) throw new Error("Not signed in");
    return runInvitePeople(this.photos, uid, emails, role);
  }

  async removePerson(uid: string, email: string): Promise<SharingInfo> {
    if (!this.photos) throw new Error("Not signed in");
    return runRemovePerson(this.photos, uid, email);
  }

  async stopSharing(uid: string): Promise<SharingInfo> {
    if (!this.photos) throw new Error("Not signed in");
    return runStopSharing(this.photos, uid);
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
      if (cached) out.push({ uid, name: cached.name, mediaType: cached.mediaType, size: cached.size ?? null });
      else missing.push(uid);
    }
    if (missing.length === 0) return out;

    for await (const node of this.photos.iterateNodes(missing)) {
      const n = node as any;
      if (n.missingUid) continue; // node vanished server-side
      const meta = { name: nodeName(n), mediaType: n.mediaType ?? null };
      // This decrypt already holds the revision, so record its claimed size next to the
      // name: the Explorer mount needs exactly that size and can then skip a second fetch
      // for this node. Only a positive size is stored, and it is the exact cloud
      // claimedSize the reconcile guard checks — a node without one stays size-less.
      // The video length comes off the same revision, so the grid's pill costs nothing
      // extra for any photo search has already indexed.
      const revision = n.activeRevision?.ok ? n.activeRevision.value : null;
      const size = Number(revision?.claimedSize ?? 0);
      const durationMs = nodeDurationMs(n) ?? 0;
      metaPut(n.uid, size > 0 ? { ...meta, size, durationMs } : { ...meta, durationMs });
      // The size travels with the name because the viewer's contents list shows both,
      // and it is already in hand here: fetching it separately would mean a second
      // decrypt of a revision this loop has already opened.
      out.push({ uid: n.uid, name: meta.name, mediaType: meta.mediaType, size: size > 0 ? size : null });
    }
    return out;
  }

  /**
   * Media types, for telling a video from a photo. Cache-first and batched, so a
   * screenful costs one call and most of it is answered from disk with no lookup.
   *
   * The grid and the viewer both branch on this rather than on the Videos tag, because a
   * file uploaded by a client that set no tag has none and would otherwise be treated as
   * a still for good.
   */
  async getMediaTypes(uids: string[]): Promise<{ uid: string; mediaType: string | null }[]> {
    if (!this.photos) throw new Error("Not signed in");
    const resolved = await resolveMediaTypesBatch(this.photos, uids);
    return [...resolved].map(([uid, mediaType]) => ({ uid, mediaType }));
  }

  /**
   * Video lengths in milliseconds, for the grid's duration pill. Cache-first, and
   * one lookup for whatever is left, so a screenful of videos costs a single call
   * rather than one per tile. Only the videos that have a length come back.
   */
  async getDurations(uids: string[]): Promise<{ uid: string; durationMs: number }[]> {
    if (!this.photos) throw new Error("Not signed in");
    const resolved = await resolveDurationsBatch(this.photos, uids);
    return [...resolved].map(([uid, durationMs]) => ({ uid, durationMs }));
  }

  // ---- Upload ----

  /**
   * Kicks the job off and returns at once; the UI polls `uploadStatus`.
   *
   * `frames` is the host's staged picture of each file sharp cannot open, keyed by path,
   * and is how a video reaches Proton with a thumbnail. `media` is what the host asked
   * Windows about those same files, and is how a video reaches Proton with a length.
   */
  startUpload(
    paths: string[],
    frames: Record<string, string> = {},
    media: Record<string, ShellMediaInfo> = {},
  ): { started: boolean } {
    if (!this.photos) throw new Error("Not signed in");
    runUpload(this.photos, paths, frames, media);
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

  // ---- Single-photo actions (SDK: getNode / renameNode / trashNodes / updatePhotos) ----

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

  // ---- Trash (SDK: iterateTrashedNodeUids / restoreNodes / deleteNodes / emptyTrash) ----

  async listTrashed(): Promise<TrashItem[]> {
    if (!this.photos) throw new Error("Not signed in");
    return readTrash(this.photos);
  }

  async restorePhotos(uids: string[]): Promise<TrashResult[]> {
    if (!this.photos) throw new Error("Not signed in");
    return runRestore(this.photos, uids);
  }

  async deletePhotosForever(uids: string[]): Promise<TrashResult[]> {
    if (!this.photos) throw new Error("Not signed in");
    return runDeleteForever(this.photos, uids);
  }

  async emptyTrash(): Promise<{ emptied: boolean }> {
    if (!this.photos) throw new Error("Not signed in");
    return runEmptyTrash(this.photos);
  }

  /**
   * Sets or clears the Favorite tag on photos, reporting per-node results like
   * `trashPhotos`. Favouriting a photo that lives only in an album also moves it
   * into the timeline (an SDK-side effect); the photo stays in the album.
   */
  async setFavorite(
    uids: string[],
    favorite: boolean,
  ): Promise<{ uid: string; ok: boolean; error?: string }[]> {
    if (!this.photos) throw new Error("Not signed in");
    const updates = uids.map((uid) => ({
      nodeUid: uid,
      tagsToAdd: favorite ? [PhotoTag.Favorites] : [],
      tagsToRemove: favorite ? [] : [PhotoTag.Favorites],
    }));
    const out: { uid: string; ok: boolean; error?: string }[] = [];
    for await (const r of this.photos.updatePhotos(updates)) {
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
