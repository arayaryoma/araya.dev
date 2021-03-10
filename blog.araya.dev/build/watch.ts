import { CWD } from "./io.ts";

// await import("./build.tsx");

const watcher = Deno.watchFs(`${CWD}/src`);
for await (const event of watcher) {
  await import("./build.tsx");
}
