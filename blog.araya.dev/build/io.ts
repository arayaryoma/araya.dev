import { dir } from "console";
import legacyFs from "fs";
const fs = legacyFs.promises;

export const CWD = process.cwd();

export const readDir = fs.readdir;

export const readFileContent = async (path: string): Promise<string> => {
  const file = await fs.readFile(path, "utf-8");
  return file;
};

export const copyFile = (from: string, to: string): Promise<void> => {
  return fs.copyFile(from, to);
};

export const writeFile = fs.writeFile;

// Ensures that the directory exists. If the directory structure does not exist, it is created. Like mkdir -p.
export const ensureDir = async (dirname: string): Promise<void> => {
  if (!(await isExist(dirname))) {
    await fs.mkdir(dirname, { recursive: true });
    return ensureDir(dirname);
  }
};

// Ensures that the file exists. If the file that is requested to be created is in directories that do not exist, these directories are created.
// If the file already exists, it is NOT MODIFIED.
export const ensureFile = async (filename: string): Promise<void> => {
  if (await isExist(filename)) {
    return;
  }
  await fs.writeFile(filename, new Uint8Array());
};

export const recursiveReaddir = async (dir: string, files: string[] = []) => {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const dirs = [];
  for (const dirent of dirents) {
    if (dirent.isDirectory()) dirs.push(`${dir}/${dirent.name}`);
    if (dirent.isFile()) files.push(`${dir}/${dirent.name}`);
  }
  for (const d of dirs) {
    files = await recursiveReaddir(d, files);
  }
  return Promise.resolve(files);
};

const isExist = async (path: string): Promise<boolean> => {
  try {
    await fs.access(path, legacyFs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};
