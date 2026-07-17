import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
// https://astro.build/config
import react from "@astrojs/react";

const SITE_ORIGIN = process.env.SITE_ORIGIN || undefined;

// https://astro.build/config
export default defineConfig({
  // A prerendered dynamic image endpoint ([slug].og.png.ts) breaks under
  // "always" because Astro appends a trailing slash to file-extension
  // endpoints and then fails their param reverse-lookup during prerender.
  trailingSlash: "ignore",
  integrations: [mdx(), react()],
  site: SITE_ORIGIN,
});
