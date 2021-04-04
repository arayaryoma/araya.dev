import { createHash } from "crypto";

const hash = createHash("md5");

export const contentHash = (content: string) => {
  return createHash("md5")
    .update(content)
    .digest("hex");
};
