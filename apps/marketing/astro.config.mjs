import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import sitemap from "@astrojs/sitemap";

const APP_PREFIXES = [
  "/login",
  "/logout",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/email-confirmation",
  "/auth",
  "/order",
  "/event",
  "/profile",
  "/admin",
  "/design",
  "/qr-cards",
  "/preview",
];

export default defineConfig({
  site: "https://snapshare-live.com",
  trailingSlash: "never",
  output: "static",
  build: {
    format: "directory",
  },
  integrations: [
    vue(),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, "") || "/";
        return !APP_PREFIXES.some(
          (prefix) => path === prefix || path.startsWith(`${prefix}/`)
        );
      },
    }),
  ],
  vite: {
    ssr: {
      noExternal: ["@snapshare/design"],
    },
  },
});
