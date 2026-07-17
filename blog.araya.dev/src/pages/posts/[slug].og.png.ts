import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { generateOgImage } from "../../lib/server/og-image";
import fs from "node:fs";
import path from "node:path";

export async function getStaticPaths() {
  const blogEntries = await getCollection("blog");
  return blogEntries.map((entry) => {
    return {
      params: { slug: entry.id },
      props: {
        title: entry.data.title,
        thumbnail: entry.data.thumbnail,
      },
    };
  });
}

export const GET: APIRoute = async ({ props }) => {
  const thumbnailImage =
    props.thumbnail && fs.readFileSync(path.resolve("src", props.thumbnail));
  const buffer =
    thumbnailImage ||
    (await generateOgImage({
      title: props.title ?? "",
    }));
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png" },
  });
};
