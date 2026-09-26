import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

/** Static build for https://jotsmedia.github.io/iswas/ */
export default defineConfig({
  base: "/iswas/",
  nitro: {
    hooks: {
      "prerender:generate"(route: { fileName?: string; contents?: string }) {
        if (!route.fileName?.endsWith(".html") || !route.contents) return;
        const file = join("/tmp/gh-html", route.fileName);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, route.contents);
        console.log("[gh-pages] wrote", file);
      },
    },
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      pages: [
        { path: "/" },
        { path: "/need" },
        { path: "/stars" },
        { path: "/form" },
        { path: "/comparison" },
        { path: "/contact" },
      ],
      prerender: {
        enabled: true,
        crawlLinks: true,
        onSuccess({ page, html }) {
          const rel = page.path === "/" ? "index.html" : `${page.path.replace(/^\//, "")}/index.html`;
          const file = join("/tmp/gh-html", rel);
          mkdirSync(dirname(file), { recursive: true });
          writeFileSync(file, html);
          console.log("[gh-pages] wrote", file);
        },
      },
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          crawlLinks: true,
        },
      },
    }),
    nitro({
      preset: "static",
      prerender: {
        crawlLinks: true,
        routes: ["/iswas/", "/iswas/need/", "/iswas/stars/", "/iswas/form/", "/iswas/comparison/", "/iswas/contact/"],
      },
    }),
    viteReact(),
  ],
});
