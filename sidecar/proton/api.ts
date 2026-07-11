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

// Raw Proton API client for the sidecar: auth + core endpoints, plus the
// session-aware HTTP client the Drive SDK consumes.

export const BASE_URL = "https://drive-api.proton.me";
// Mirror the Android app's proven appVersion exactly. The underscore form passes
// both ProtonCore's client-side regex and the auth server; other shapes get a
// "this version is no longer supported" rejection. Do not change the shape.
export const APP_VERSION = "external-drive-akoos_proton_photos@2.3.10-stable";
export const USER_AGENT = "AkoosProtonPhotos/2.3.10 (Windows 11; Desktop)";

export type Session = { uid: string; accessToken: string; refreshToken?: string };

/** A human-verification challenge the API demands (Code 9001). */
export type HvChallenge = { token: string; methods: string[] };
/** The solved proof, replayed as headers on the retried request. */
export type HvProof = { token: string; type: string };

/**
 * Proton's captcha page. `ForceWebMessaging=1` makes it report the result with
 * `window.parent.postMessage({type: "pm_captcha", token}, "*")`, so it can be
 * embedded in an iframe and the token read from the message.
 */
export const captchaUrl = (token: string): string =>
  `${BASE_URL}/core/v4/captcha?Token=${encodeURIComponent(token)}&ForceWebMessaging=1&Dark=1`;

/** Field names are not in the SDK's type set, so read defensively and log misses. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hvChallengeFrom(json: any): HvChallenge | null {
  if (json?.Code !== 9001) return null;
  const d = json.Details ?? {};
  const token = d.HumanVerificationToken ?? d.Token;
  const methods = d.HumanVerificationMethods ?? d.Methods ?? [];
  if (!token) {
    process.stderr.write(`[api] 9001 without a token; Details=${JSON.stringify(d)}\n`);
    return null;
  }
  return { token, methods };
}

function baseHeaders(session?: Session): Record<string, string> {
  const h: Record<string, string> = {
    "x-pm-appversion": APP_VERSION,
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.protonmail.v1+json",
  };
  if (session) {
    h["x-pm-uid"] = session.uid;
    h["Authorization"] = `Bearer ${session.accessToken}`;
  }
  return h;
}

async function apiFetch(
  path: string,
  opts: { method?: string; body?: object; session?: Session; hv?: HvProof } = {},
): Promise<Record<string, unknown>> {
  const headers = baseHeaders(opts.session);
  if (opts.body) headers["Content-Type"] = "application/json";
  if (opts.hv) {
    headers["x-pm-human-verification-token"] = opts.hv.token;
    headers["x-pm-human-verification-token-type"] = opts.hv.type;
  }
  const res = await fetch(BASE_URL + path, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    /* non-JSON body */
  }
  const ok = res.ok && (json?.Code === undefined || json.Code === 1000 || json.Code === 1001);
  if (!ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err: any = new Error(json?.Error || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = json?.Code;
    err.details = json;
    err.hv = hvChallengeFrom(json);
    throw err;
  }
  return json;
}

export const ProtonApi = {
  authInfo: (username: string) =>
    apiFetch("/auth/v4/info", { method: "POST", body: { Username: username } }),
  auth: (body: object, hv?: HvProof) => apiFetch("/auth/v4", { method: "POST", body, hv }),
  auth2fa: (session: Session, code: string) =>
    apiFetch("/auth/v4/2fa", { method: "POST", body: { TwoFactorCode: code }, session }),
  getUser: (session: Session) => apiFetch("/core/v4/users", { session }),
  getAddresses: (session: Session) => apiFetch("/core/v4/addresses", { session }),
  getKeySalts: (session: Session) => apiFetch("/core/v4/keys/salts", { session }),
  /** Public keys for an address, used to verify signatures on decrypted metadata. */
  getAddressPublicKeys: (session: Session, email: string) =>
    apiFetch(`/core/v4/keys/all?Email=${encodeURIComponent(email)}&InternalOnly=1`, { session }),
  photosShare: (session: Session) => apiFetch("/drive/v2/shares/photos", { session }),
};

/** Refresh the access token using the stored refresh token (used on resume). */
export async function refreshSession(uid: string, refreshToken: string): Promise<Session> {
  const res = await fetch(BASE_URL + "/auth/v4/refresh", {
    method: "POST",
    headers: {
      "x-pm-appversion": APP_VERSION,
      "User-Agent": USER_AGENT,
      "Content-Type": "application/json",
      "x-pm-uid": uid,
      Accept: "application/vnd.protonmail.v1+json",
    },
    body: JSON.stringify({
      UID: uid,
      RefreshToken: refreshToken,
      ResponseType: "token",
      GrantType: "refresh_token",
      RedirectURI: "https://protonmail.ch",
      State: "resume",
    }),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || (json?.Code && json.Code !== 1000)) {
    throw new Error(json?.Error || `token refresh failed (HTTP ${res.status})`);
  }
  return { uid: json.UID ?? uid, accessToken: json.AccessToken, refreshToken: json.RefreshToken };
}

/**
 * The ProtonDriveHTTPClient the SDK calls for Drive requests.
 *
 * Proton access tokens are short-lived, so a 401 on a first-party API call means
 * "token expired": refresh once and retry, rather than surfacing it as a signed-out
 * state (which is what forced frequent re-logins). `onRefreshed` persists the new
 * tokens. Refresh is single-flight because Proton rotates the refresh token on every
 * use, so concurrent refreshes would invalidate each other and force a real logout.
 */
export function makeSdkHttpClient(session: Session, onRefreshed?: () => void) {
  function inject(url: string, headers: Headers): Headers {
    headers.set("x-pm-appversion", APP_VERSION);
    headers.set("User-Agent", USER_AGENT);
    // Only attach the API session to first-party API hosts; block storage (CDN)
    // uses its own pm-storage-token that the SDK sets on the request itself.
    if (url.startsWith(BASE_URL)) {
      headers.set("x-pm-uid", session.uid);
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }
    return headers;
  }

  let refreshing: Promise<void> | null = null;
  function refresh(): Promise<void> {
    if (!refreshing) {
      refreshing = (async () => {
        if (!session.refreshToken) throw new Error("no refresh token");
        const fresh = await refreshSession(session.uid, session.refreshToken);
        // Mutate the shared session object in place so later requests (and the
        // persisted blob) see the new tokens.
        session.uid = fresh.uid;
        session.accessToken = fresh.accessToken;
        session.refreshToken = fresh.refreshToken;
        onRefreshed?.();
      })().finally(() => {
        refreshing = null;
      });
    }
    return refreshing;
  }

  async function withAuthRetry(url: string, run: () => Promise<Response>): Promise<Response> {
    const res = await run();
    if (res.status === 401 && url.startsWith(BASE_URL)) {
      try {
        await refresh();
      } catch {
        return res; // refresh failed: surface the original 401
      }
      return run(); // retry once with the fresh access token
    }
    return res;
  }

  return {
    async fetchJson(req: {
      url: string;
      method: string;
      headers: Headers;
      json?: object;
      body?: BodyInit;
      signal?: AbortSignal;
    }): Promise<Response> {
      return withAuthRetry(req.url, () => {
        const headers = inject(req.url, new Headers(req.headers));
        if (req.json) headers.set("Content-Type", "application/json");
        return fetch(req.url, {
          method: req.method,
          headers,
          body: req.json ? JSON.stringify(req.json) : req.body,
          signal: req.signal,
        });
      });
    },
    async fetchBlob(req: {
      url: string;
      method: string;
      headers: Headers;
      body?: BodyInit;
      signal?: AbortSignal;
    }): Promise<Response> {
      return withAuthRetry(req.url, () => {
        const headers = inject(req.url, new Headers(req.headers));
        return fetch(req.url, { method: req.method, headers, body: req.body, signal: req.signal });
      });
    },
  };
}
