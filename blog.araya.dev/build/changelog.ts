import "zx/globals";
import path from "node:path";

$.log = (entry) => {
  switch (entry.kind) {
    default: {
      // Do nothing
    }
  }
};

export async function getChangelog(filename: string): Promise<
  Array<{
    hash: string;
    subject: string;
  }>
> {
  const CWD = process.cwd();
  const filepath = path.resolve(CWD, "src", "content", "blog", filename);
  const result =
    await $`git log --pretty='format:{"hash": "%H", "subject": "%s"}' ${filepath}`;
  const logs = result.stdout.split("\n").map((item) => JSON.parse(item));
  return logs;
}
