import { rm, mkdir } from "node:fs/promises";
import { build } from "esbuild";

const outdir = "public";

await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

const common = {
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ["es2022", "safari16"],
  logLevel: "info",
};

await Promise.all([
  build({
    ...common,
    entryPoints: ["client/main.ts"],
    format: "esm",
    outfile: `${outdir}/app.js`,
  }),
  // Loaded synchronously in <head>, so it must not be a module: a module is
  // deferred, which is exactly the theme flash it exists to prevent.
  build({
    ...common,
    entryPoints: ["client/theme.ts"],
    format: "iife",
    outfile: `${outdir}/theme.js`,
  }),
  build({
    ...common,
    entryPoints: ["client/styles.css"],
    outfile: `${outdir}/app.css`,
    // styles.css imports the blog's markdown.css, and esbuild would otherwise
    // pick up blog.araya.dev/tsconfig.json (which extends an Astro config that
    // is not installed here) while resolving it. No TS is involved either way.
    tsconfigRaw: {},
  }),
]);
