import { watch } from "chokidar";
import { build } from "./build";
import { CWD } from "./io";
import { path } from "./path";

const dirPath = path.resolve(CWD, "src");

console.log("watching:", dirPath);

watch(dirPath).on("change", (file) => {
  console.log("Detected file changes. Building...");
  build().then(() => {
    console.log("Build has been completed");
  });
});
