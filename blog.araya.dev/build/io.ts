export { ensureDir, ensureFile } from "https://deno.land/std@0.83.0/fs/mod.ts";
export { recursiveReaddir } from "https://deno.land/x/recursive_readdir/mod.ts";

export const CWD = Deno.cwd();

export const readDir = Deno.readDir;

// export const readDirRecursive = async (
//   path: string,
//   entries: ReturnType<typeof readDir> = []
// ): Promise<Array<string>> => {
//   const filePaths: ReturnType<typeof readDir> = [];
//   for (const entry of entries) {
//     if (entry.isFile) {
//       filePaths.push(entry);
//     } else {
//       filePaths.push(...(await readDirRecursive(entry)));
//     }
//   }
//   return filePaths;
// };

export const readFileContent = async (path: string): Promise<Uint8Array> => {
  const file = await Deno.open(path, {
    read: true,
  });
  const content = await Deno.readAll(file);
  Deno.close(file.rid);
  return content;
};

export const copyFile = (from: string, to: string) => {
  return Deno.copyFile(from, to);
};

export const writeFile = Deno.writeFile;
