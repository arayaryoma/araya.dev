import { GitLog } from "./types/index.d.ts";

const decoder = new TextDecoder("utf-8");
const separator = "____";

export async function getLog(filePath: string): Promise<GitLog[]> {
  const cmd = Deno.run({
    cmd: ["git", "log", `--format=%H${separator}%aI${separator}%s`, filePath],
    stdout: "piped",
    stderr: "piped",
  });

  const output = decoder.decode(await cmd.output());
  const logs = output.split("\n");

  // trim unnecessary empty string
  logs.pop();
  return logs.map((log) => {
    const [hash, date, message] = log.split(separator);
    return { hash, date, message };
  });
}
