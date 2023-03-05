import { defineConfig } from 'astro/config';
import changelog from './build/changelog';
import mdx from '@astrojs/mdx';

// https://astro.build/config
import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  trailingSlash: 'always',
  integrations: [mdx(), image(), changelog()]
});