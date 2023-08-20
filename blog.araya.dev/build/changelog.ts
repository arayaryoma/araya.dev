import { execSync } from "node:child_process";
import { resolve } from "node:path";

export async function getChangelog(filename: string): Promise<
  Array<{
    hash: string;
    subject: string;
  }>
> {
  const CWD = process.cwd();
  const filepath = resolve(CWD, "src", "content", "blog", filename);
  const cmd = `git log --pretty='format:{"hash": "%H", "subject": "%s"}' ${filepath}`;
  const result = execSync(cmd, { encoding: "utf-8" });
  const logs = result.split("\n").map((item) => JSON.parse(item));
  return logs;
}
