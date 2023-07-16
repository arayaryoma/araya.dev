import type { APIRoute } from "astro";

export const get: APIRoute = async ({ params, request }) => {
  const res = await fetch(
    "https://docs.astro.build/assets/full-logo-light.png"
  );

  const buffer = Buffer.from(await res.arrayBuffer());
  return {
    body: buffer,
    encoding: "binary",
  };
};
