import path from "node:path";
import { execSync } from "node:child_process";

export async function getChangelog(filename: string): Promise<
  Array<{
    hash: string;
    subject: string;
  }>
> {
  const CWD = process.cwd();
  const filepath = path.resolve(CWD, "src", "content", "blog", filename);
  const cmd = `git log --pretty='format:{"hash": "%H", "subject": "%s"}' ${filepath}`;
  const result = execSync(cmd).toString();

  const logs = result.split("\n").map((item) => JSON.parse(item));
  return logs;
}
