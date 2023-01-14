import { watch } from "chokidar";

export const CWD = process.cwd();

import "zx/globals";

const distDir = `${CWD}/dist`;
const srcRoot = `${CWD}/src`;

$`pnpm astro build`;

console.log("watching:", srcRoot);

watch(srcRoot).on("change", (file) => {
  console.log("Detected file changes. Building...");
  (async () => {
    await $`pnpm astro build`;
  })().then(() => {
    console.log("Build has been completed");
  });
});
