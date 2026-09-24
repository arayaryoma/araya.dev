import { rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { globSync, readdirSync } from "node:fs";
import { build } from "esbuild";

// node:test cannot run the TypeScript sources directly (extensionless relative
// imports, and the Worker code is written for the Workers runtime), so the
// tests are bundled for node first.
// Not under node_modules: node --test skips that directory entirely.
const outdir = ".test";
await rm(outdir, { recursive: true, force: true });

await build({
  entryPoints: globSync("test/*.test.ts"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  outdir,
  sourcemap: "inline",
  external: ["node:*"],
  // `yaml` resolves to its CommonJS build under the "node" condition, and a
  // CJS dependency bundled into ESM needs a real require() to call.
  banner: {
    js: "import { createRequire } from 'node:module';\nconst require = createRequire(import.meta.url);",
  },
  logLevel: "warning",
});

const result = spawnSync(
  process.execPath,
  [
    "--test",
    "--enable-source-maps",
    ...readdirSync(outdir).map((name) => `${outdir}/${name}`),
  ],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
