// Produces everything the shipped app needs to run the sidecar without Node,
// npm or the source tree being present on the user's machine.
//
// Output:
//   sidecar/build/server.mjs        the whole sidecar, bundled
//   sidecar/build/node_modules/     sharp only (a native addon, cannot be inlined)
//   app/src-tauri/binaries/sidecar-<triple>.exe   a copy of node.exe
//
// Why ESM: openpgp's Node build calls `createRequire(import.meta.url)`, which a
// CJS bundle cannot satisfy. Emitting ESM keeps `import.meta` real.
//
// Why the banner: some transitive dependencies are CJS and call `require()` at
// run time. esbuild's ESM output stubs `require` to throw, but its shim defers
// to a `require` already in scope, so defining one here makes those calls work.
//
// Why the alias: `@protontech/crypto` imports `openpgp/lightweight`, a subpath
// that only exports a `browser` condition. Pointing it at the full `openpgp`
// selects the proper Node build, which is why the shipped app does not need the
// `--conditions=browser` crutch the dev spawn relies on.
import { build } from "esbuild";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "build");
const binDir = join(here, "..", "app", "src-tauri", "binaries");

const banner = [
  "import { createRequire as __createRequire } from 'module';",
  "import { fileURLToPath as __fileURLToPath } from 'url';",
  "import { dirname as __pathDirname } from 'path';",
  "const require = __createRequire(import.meta.url);",
  "const __filename = __fileURLToPath(import.meta.url);",
  "const __dirname = __pathDirname(__filename);",
].join("\n");

await build({
  entryPoints: [join(here, "server.ts")],
  outfile: join(outDir, "server.mjs"),
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  external: ["sharp"],
  alias: { "openpgp/lightweight": "openpgp" },
  banner: { js: banner },
  legalComments: "none",
  logLevel: "warning",
});
console.log("bundled  -> build/server.mjs");

// sharp is the one dependency that cannot be bundled, so install just it, with
// its own dependency tree, beside the bundle where Node will resolve it.
writeFileSync(
  join(outDir, "package.json"),
  JSON.stringify({ name: "sidecar-dist", private: true, dependencies: { sharp: "^0.35.3" } }, null, 2),
);
// `shell: true` is required on Windows: since Node 20, spawning a `.cmd` such as
// npm.cmd without a shell is refused.
const npm = spawnSync("npm", ["install", "--omit=dev", "--silent"], {
  cwd: outDir,
  stdio: "inherit",
  shell: true,
});
if (npm.status !== 0) throw new Error("installing sharp beside the bundle failed");
console.log("staged   -> build/node_modules (sharp)");

// Tauri's externalBin looks for a target-triple suffix and strips it when it
// copies the file next to the app executable.
const triple = execFileSync("rustc", ["-vV"], { encoding: "utf8" })
  .split("\n")
  .find((line) => line.startsWith("host:"))
  .slice("host:".length)
  .trim();

mkdirSync(binDir, { recursive: true });
const target = join(binDir, `sidecar-${triple}${process.platform === "win32" ? ".exe" : ""}`);
copyFileSync(process.execPath, target);
console.log(`runtime  -> binaries/sidecar-${triple} (node ${process.version})`);
