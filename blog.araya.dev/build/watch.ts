import { watch } from "chokidar";
import { build } from "./build";
import { CWD, forceRemoveDir } from "./io";
import rimraf from "rimraf";

const distDir = `${CWD}/dist`;
const srcRoot = `${CWD}/src`;

console.log("watching:", srcRoot);

watch(srcRoot).on("change", (file) => {
  console.log("Detected file changes. Building...");
  (async () => {
    await forceRemoveDir(distDir);
    await build();
  })().then(() => {
    console.log("Build has been completed");
  });
});
