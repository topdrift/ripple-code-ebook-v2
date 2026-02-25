// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://a-tndn.github.io',
  base: '/ripple-code-ebook-v2/',
  output: 'static',
  integrations: [mdx(), preact(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
