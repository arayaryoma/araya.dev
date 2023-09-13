import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
// https://astro.build/config
import react from "@astrojs/react";

const SITE_ORIGIN = process.env.SITE_ORIGIN || undefined;

// https://astro.build/config
export default defineConfig({
  trailingSlash: "always",
  integrations: [mdx(), react()],
  site: SITE_ORIGIN,
});
