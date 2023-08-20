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
  const svg = await satori(
    <div
      style={{
        display: "flex",
        backgroundColor: "#f8f8f8",
        color: "#6450a1",
        height: "100%",
        flexDirection: "column",
      }}
    >
      <h1 style={{ fontSize: "44px" }}>{title}</h1>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span>blog.araya.dev</span>
      </div>
    </div>,
    {
      width: 800,
      height: 400,
      fonts: [
        {
          name: "ZenMaruGothic",
          data: fs.readFileSync(
            path.resolve(
              __dirname,
              "../../../public/assets/fonts/ZenMaruGothic-Bold.ttf"
            )
          ),
          weight: 700,
          style: "normal",
          lang: "ja-JP",
        },
      ],
      embedFont: true,
    }
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
