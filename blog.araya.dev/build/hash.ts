import { createHash } from "crypto";

const hash = createHash("md5");

export const contentHash = (content: string) => {
  hash.update(content);
  return hash.toString();
};
