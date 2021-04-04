import util from "util";
import childProcess from "child_process";

const exec = util.promisify(childProcess.exec);
const separator = "____";

export async function getLog(filePath: string): Promise<GitLog[]> {
  const cmd = {
    cmd: ["git", "log", `--format=%H${separator}%aI${separator}%s`, filePath],
    stdout: "piped",
    stderr: "piped",
  };
  const { stdout, stderr } = await exec(
    `git log --format=%H${separator}%aI${separator}%s ${filePath}`
  );

  const logs = stdout.split("\n");

  // trim unnecessary empty string
  logs.pop();
  return logs.map((log) => {
    const [hash, date, message] = log.split(separator);
    return { hash, date, message };
  });
}
