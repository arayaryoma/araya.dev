import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { generateOgImage } from "../../lib/server/og-image";

export async function getStaticPaths() {
  const blogEntries = await getCollection("blog");
  return blogEntries.map((entry) => {
    return {
      params: { slug: entry.slug },
      props: {
        title: entry.data.title,
      },
    };
  });
}

export const get: APIRoute = async ({ params, props }) => {
  const buffer = await generateOgImage({
    title: props.title ?? "",
  });
  return {
    body: buffer,
    encoding: "binary",
  };
};
