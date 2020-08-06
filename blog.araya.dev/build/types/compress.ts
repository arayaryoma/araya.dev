import { createBrotliCompress } from "zlib";
import { promisify } from "util";
import { pipeline } from "stream";
import { createReadStream, createWriteStream } from "fs";
const pipe = promisify(pipeline);

export const compressAsBrotli = async (input: string, output: string) => {
    console.log(input, output);
  const brotli = createBrotliCompress();
  const source = createReadStream(input);
  const destination = createWriteStream(output);
  await pipe(source, brotli, destination);
};
