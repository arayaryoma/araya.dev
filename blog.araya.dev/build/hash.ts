import { createHash } from "https://deno.land/std@0.86.0/hash/mod.ts";

export const contentHash = (content: string) => {
  const hash = createHash("md5");
  hash.update(content);
  return hash.toString();
};
