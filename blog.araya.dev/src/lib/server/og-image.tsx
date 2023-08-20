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
        backgroundColor: "#1c1b3c",
        color: "#dedede",
        height: "100%",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", marginLeft: "32px", marginRight: "32px" }}>
        <h1 style={{ fontSize: "44px" }}>{title}</h1>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          position: "absolute",
          bottom: "32px",
          right: "32px",
        }}
      >
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
