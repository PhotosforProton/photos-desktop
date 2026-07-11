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

// CryptoProxy init + the crypto/SRP modules the Drive SDK needs, wired to
// Proton's own @protontech/crypto (pure JS/WASM, no native lib).

import { CryptoProxy } from "@protontech/crypto";
import { Api as CryptoApi } from "@protontech/crypto/proxy/endpoint/api.ts";
import { getSrp, computeKeyPassword, generateKeySalt } from "@protontech/crypto/srp";
import { OpenPGPCryptoWithCryptoProxy } from "@protontech/drive-sdk";

let initialized = false;

/** Init pmcrypto and point CryptoProxy at the direct (no web worker) endpoint — correct for Node. */
export function initCrypto(): void {
  if (initialized) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (CryptoApi as any).init({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CryptoProxy.setEndpoint(new CryptoApi() as any, (endpoint: any) => endpoint.clearKeyStore?.());
  initialized = true;
}

export { CryptoProxy };

/** The SDK's ready-made OpenPGP module implementation over CryptoProxy. */
export function makeOpenPGPCryptoModule() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new OpenPGPCryptoWithCryptoProxy(CryptoProxy as any);
}

/**
 * Adapter from @protontech/crypto SRP functions to the SDK's SRPModule shape.
 * The SDK uses this for in-Drive SRP (e.g. public links); account login below
 * calls getSrp() directly with the real username.
 */
export const srpModule = {
  getSrp: async (
    version: number,
    modulus: string,
    serverEphemeral: string,
    salt: string,
    password: string,
  ) => {
    const { clientEphemeral, clientProof, expectedServerProof } = await getSrp(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { Version: version, Modulus: modulus, ServerEphemeral: serverEphemeral, Salt: salt, Username: "" } as any,
      { username: "", password },
      version,
    );
    return { clientEphemeral, clientProof, expectedServerProof };
  },
  getSrpVerifier: async () => {
    throw new Error("getSrpVerifier is not needed for the viewer");
  },
  computeKeyPassword: (password: string, salt: string) => computeKeyPassword(password, salt),
  generateKeySalt: () => generateKeySalt(),
};

export { getSrp };
