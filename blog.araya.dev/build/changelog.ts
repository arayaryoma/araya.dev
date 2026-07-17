import path from "node:path";
import { execSync } from "node:child_process";

export async function getChangelog(
  // Content-layer entries expose filePath relative to the project root; it is
  // undefined for non-file-backed loaders, so treat that as "no history".
  relativeFilePath: string | undefined,
): Promise<
  Array<{
    hash: string;
    subject: string;
  }>
> {
  if (!relativeFilePath) {
    return [];
  }
  const CWD = process.cwd();
  const filepath = path.resolve(CWD, relativeFilePath);
  const cmd = `git log --pretty='format:{"hash": "%H", "subject": "%s"}' ${filepath}`;
  const result = execSync(cmd).toString();

  const logs = result
    .split("\n")
    .filter((item) => item.length > 0)
    .map((item) => {
      return JSON.parse(item);
    });
  return logs;
}
