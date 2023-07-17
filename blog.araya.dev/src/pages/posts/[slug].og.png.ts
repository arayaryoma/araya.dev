import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { generateOgImage } from "../../lib/server/og-image";

export async function getStaticPaths() {
  const blogEntries = await getCollection("blog");
  return blogEntries.map((entry) => {
    return {
      params: { slug: entry.slug },
    };
  });
}

export const get: APIRoute = async ({ params, request }) => {
  const buffer = await generateOgImage({
    title: params.slug ?? "",
  });
  return {
    body: buffer,
    encoding: "binary",
  };
};
