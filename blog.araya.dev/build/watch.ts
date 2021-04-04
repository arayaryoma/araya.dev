// import { CWD } from "./io.ts";
// import { build } from "./build.tsx";

// const watcher = Deno.watchFs(`${CWD}/src`);
// for await (const event of watcher) {
//   console.log(event.kind, event.paths);
//   await build();
//   await sleep(100);
// }

// function sleep(ms: number): Promise<void> {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve(undefined);
//     }, ms);
//   });
// }
