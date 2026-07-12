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

import { useEffect, useRef, useState, type FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Titlebar } from "./components/Titlebar";
import { UpdateBanner } from "./components/UpdateBanner";
import { Photos } from "./views/Photos";
import { Lock } from "./views/Lock";
import { rpc } from "./lib/rpc";
import { applyTheme, type ThemeMode } from "./lib/theme";
import { useT } from "./lib/i18n";
import "./styles/App.css";

type Phase = "credentials" | "twofa" | "captcha";
type MenuState = { x: number; y: number } | null;
type LoginResult =
  | { status: "ok"; email: string }
  | { status: "2fa" }
  | { status: "hv"; url: string }
  | { status: "error"; error: string };
type LockStatus = { hasVault: boolean; unlocked: boolean; email: string | null };

function App() {
  const t = useT();
  const [restoring, setRestoring] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  // Set when a saved (encrypted) account exists but is still locked: the app
  // shows the lock screen and waits for the password before anything else.
  const [locked, setLocked] = useState<{ email: string | null } | null>(null);
  const [phase, setPhase] = useState<Phase>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [menu, setMenu] = useState<MenuState>(null);
  const [hvUrl, setHvUrl] = useState<string | null>(null);
  const captchaBoxRef = useRef<HTMLDivElement>(null);
  // The tray listeners register once on mount, so they read the live email
  // through this ref instead of a stale closure captured at registration.
  const emailRef = useRef<string | null>(null);

  // Read here rather than in Photos: the theme has to be up for the sign-in
  // screen, which paints long before Photos mounts.
  useEffect(() => {
    (async () => {
      try {
        const raw = await invoke<string | null>("store_get", { name: "settings" });
        if (raw) {
          const s = JSON.parse(raw);
          applyTheme((s.theme as ThemeMode) ?? "dark", s.palette);
        }
      } catch {
        /* keep the default dark theme */
      }
    })();
  }, []);

  // On startup, decide between the app, the lock screen, and a fresh sign-in.
  useEffect(() => {
    (async () => {
      try {
        // A reload throws away the WebView, not the sidecar process. If the vault
        // is still unlocked in it, reuse the live session and skip the password.
        const live = await rpc<{ email: string } | null>("whoami").catch(() => null);
        if (live) {
          setEmail(live.email);
          setRestoring(false);
          return;
        }

        // Otherwise ask the sidecar what it holds. A saved-but-locked account
        // (cold start) always needs the password before the session is readable.
        const s = await rpc<LockStatus>("lockStatus");
        if (s.unlocked && s.email) {
          setEmail(s.email);
        } else if (s.hasVault) {
          setLocked({ email: s.email });
        }
        // else: no saved account -> fall through to the full sign-in screen.
      } catch {
        /* fall through to the login screen */
      }
      setRestoring(false);
    })();
  }, []);

  // Disable the native context menu and show our own (to be expanded later).
  useEffect(() => {
    function onContextMenu(e: MouseEvent) {
      e.preventDefault();
      setMenu({ x: e.clientX, y: e.clientY });
    }
    function dismiss() {
      setMenu(null);
    }
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("click", dismiss);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("click", dismiss);
    };
  }, []);

  /** Route a sign-in result to the phase it asks for. */
  async function applyResult(r: LoginResult) {
    if (r.status === "ok") {
      setPassword("");
      setEmail(r.email);
    } else if (r.status === "2fa") {
      setPhase("twofa");
    } else if (r.status === "hv") {
      setHvUrl(r.url);
      setPhase("captcha");
    } else {
      setStatus(r.error);
    }
  }

  // Proton's captcha page refuses to be iframed, so the Rust host lays a child
  // webview over this box, inside the same window, and relays the result.
  useEffect(() => {
    if (phase !== "captcha" || !hvUrl) return;
    const box = captchaBoxRef.current;
    if (!box) return;

    let unlisten: (() => void) | undefined;
    let disposed = false;

    (async () => {
      const stop = await listen<{ type: string; token: string }>("captcha", async ({ payload }) => {
        if (payload.type === "pm_captcha_expired") {
          setStatus(t("login.captchaExpired"));
          return;
        }
        if (payload.type !== "pm_captcha" || !payload.token) return;

        setBusy(true);
        setStatus("");
        try {
          await invoke("close_captcha").catch(() => {});
          await applyResult(await rpc<LoginResult>("submitCaptcha", { token: payload.token }));
        } catch (err) {
          setStatus(String(err));
        }
        setBusy(false);
      });

      if (disposed) {
        stop();
        return;
      }
      unlisten = stop;

      const r = box.getBoundingClientRect();
      await invoke("open_captcha", {
        url: hvUrl,
        x: r.left,
        y: r.top,
        width: r.width,
        height: r.height,
      }).catch((err) => setStatus(String(err)));
    })();

    return () => {
      disposed = true;
      unlisten?.();
      invoke("close_captcha").catch(() => {});
    };
  }, [phase, hvUrl]);

  // The child webview floats at absolute coordinates, so it has to be told
  // whenever its placeholder moves: window resize, maximise, or a scroll.
  useEffect(() => {
    if (phase !== "captcha" || !hvUrl) return;
    const box = captchaBoxRef.current;
    if (!box) return;

    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = box.getBoundingClientRect();
        invoke("move_captcha", {
          x: r.left,
          y: r.top,
          width: r.width,
          height: r.height,
        }).catch(() => {});
      });
    };

    const observer = new ResizeObserver(sync);
    observer.observe(box);
    window.addEventListener("resize", sync);
    const scroller = document.querySelector(".app-content");
    scroller?.addEventListener("scroll", sync, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", sync);
      scroller?.removeEventListener("scroll", sync);
    };
  }, [phase, hvUrl]);

  async function onSignIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      await applyResult(await rpc<LoginResult>("login", { username, password }));
    } catch (err) {
      setStatus(String(err));
    }
    setBusy(false);
  }

  /** Forget the account. The sidecar deletes the saved session and vault; here we relock the UI. */
  async function signOut() {
    await rpc("signOut").catch(() => {});
    setEmail(null);
    setLocked(null);
    setPhase("credentials");
    setUsername("");
    setPassword("");
    setCode("");
    setStatus("");
  }

  // Keep the ref in step with the state for the mount-time tray listeners.
  useEffect(() => {
    emailRef.current = email;
  }, [email]);

  // React to the system-tray menu. Registered once; the handlers read the live
  // email via emailRef and the live lockOnHide straight from the persisted
  // settings, so neither goes stale between mount and the moment the tray fires.
  useEffect(() => {
    let unlistenSignout: (() => void) | undefined;
    let unlistenHidden: (() => void) | undefined;
    let disposed = false;

    (async () => {
      const offSignout = await listen("tray-signout", () => {
        void signOut();
      });
      const offHidden = await listen("window-hidden", async () => {
        const current = emailRef.current;
        if (!current) return; // only when a session is open
        let lockOnHide = false;
        try {
          const raw = await invoke<string | null>("store_get", { name: "settings" });
          if (raw) lockOnHide = (JSON.parse(raw) as { lockOnHide?: boolean }).lockOnHide === true;
        } catch {
          /* leave it unlocked if the setting cannot be read */
        }
        if (!lockOnHide) return;
        await rpc("lock").catch(() => {});
        // Remember the email so the lock screen can greet the same account.
        setLocked({ email: current });
        setEmail(null);
      });

      if (disposed) {
        offSignout();
        offHidden();
        return;
      }
      unlistenSignout = offSignout;
      unlistenHidden = offHidden;
    })();

    return () => {
      disposed = true;
      unlistenSignout?.();
      unlistenHidden?.();
    };
  }, []);

  async function onSubmitCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      await applyResult(await rpc<LoginResult>("submit2fa", { code }));
    } catch (err) {
      setStatus(String(err));
    }
    setBusy(false);
  }

  return (
    <div className="app-shell">
      <Titlebar />
      <UpdateBanner />

      {restoring ? (
        <div className="app-content">
          <p className="login-sub">{t("app.restoring")}</p>
        </div>
      ) : locked ? (
        <Lock
          email={locked.email}
          onResult={(r) => {
            setLocked(null);
            void applyResult(r);
          }}
          onDifferentAccount={() => {
            setLocked(null);
            setPhase("credentials");
            setUsername("");
            setPassword("");
            setStatus("");
          }}
        />
      ) : email ? (
        <Photos email={email} onSignOut={signOut} />
      ) : (
        <div className="app-content">
          <div className={phase === "captcha" ? "login-card wide" : "login-card"}>
            <h1 className="login-title">Photos for Proton</h1>
            <p className="login-sub">{t("login.subtitle")}</p>

            {phase === "credentials" && (
              <form className="login-form" onSubmit={onSignIn}>
                <label>
                  <span>{t("login.emailLabel")}</span>
                  <input
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.currentTarget.value)}
                    placeholder="you@proton.me"
                    required
                  />
                </label>
                <label>
                  <span>{t("login.passwordLabel")}</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    placeholder={t("login.passwordPlaceholder")}
                    required
                  />
                </label>
                <button type="submit" disabled={busy}>
                  {busy ? t("login.signingIn") : t("login.signIn")}
                </button>
              </form>
            )}

            {phase === "twofa" && (
              <form className="login-form" onSubmit={onSubmitCode}>
                <label>
                  <span>{t("login.twofaLabel")}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.currentTarget.value)}
                    placeholder="123456"
                    required
                  />
                </label>
                <button type="submit" disabled={busy}>
                  {busy ? t("login.verifying") : t("login.verify")}
                </button>
                <button type="button" className="link" onClick={() => setPhase("credentials")}>
                  {t("common.back")}
                </button>
              </form>
            )}

            {phase === "captcha" && hvUrl && (
              <div className="captcha">
                <p className="captcha-hint">{t("login.captchaHint")}</p>
                <div ref={captchaBoxRef} className="captcha-frame" />
                {busy && <p className="captcha-hint">{t("login.verifying")}</p>}
                <button
                  type="button"
                  className="link"
                  onClick={() => {
                    setPhase("credentials");
                    setHvUrl(null);
                    setStatus("");
                  }}
                >
                  {t("common.back")}
                </button>
              </div>
            )}

            {status && <p className="login-status">{status}</p>}
          </div>
        </div>
      )}

      {menu && (
        <ul className="context-menu" style={{ top: menu.y, left: menu.x }}>
          <li onClick={() => window.location.reload()}>{t("menu.reload")}</li>
          <li className="disabled">{t("menu.moreSoon")}</li>
        </ul>
      )}
    </div>
  );
}

export default App;
