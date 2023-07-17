import satori from "satori";
import sharp from "sharp";
import path from "node:path";
import url from "node:url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

type OgImageParams = {
  title: string;
};

export async function generateOgImage({
  title,
}: OgImageParams): Promise<Buffer> {
  const svg = await satori(<div>{title}</div>, {
    width: 800,
    height: 400,
    fonts: [
      {
        name: "ZenMaruGothic",
        data: fs.readFileSync(
          path.resolve(__dirname, "../../assets/fonts/ZenMaruGothic-Bold.ttf")
        ),
        weight: 700,
        style: "normal",
        lang: "ja-JP",
      },
    ],
    embedFont: true,
  });

  console.log(svg);

  return sharp(Buffer.from(svg)).png().toBuffer();
}
