const SERVER_IP = "52.69.164.172";
const path = require("path");
const fs = require("fs/promises");
const { spawn, exec } = require("child_process");

const readIgnoredPaths = async () => {
  const filePath = path.resolve(process.cwd(), ".deployignore");
  const file = await fs.readFile(filePath);
  return file.toString().split("\n");
};
const run = async () => {
  const target = process.argv[2];
  const ignoredPaths = await readIgnoredPaths();
  const excludes = ignoredPaths.map(
    (ignored) => `--exclude="${path.resolve(process.cwd(), target, ignored)}"`
  ).join(" ");
  const remoteDir = path.parse(process.cwd()).name;
  const key = path.resolve(process.env.HOME, ".ssh/araya.dev.pem");
  const cmd = `rsync --delete -r -e "ssh -i ${key}" ${path.resolve(
    process.cwd(),
    target
  )}/ ${excludes} ubuntu@${SERVER_IP}:/var/www/araya.dev/playground.araya.dev/${remoteDir}`;
  console.log(cmd);
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
  });
};
run();
