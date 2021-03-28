import { createHash } from "../deps.ts";

export const contentHash = (content: string) => {
  const hash = createHash("md5");
  hash.update(content);
  return hash.toString();
};
