
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "FieldTrack - Offline Issue Tracker",
        short_name: "FieldTrack",
        description: "Offline infrastructure issue reporting system",

        theme_color: "#102b36",
        background_color: "#f3f6f8",

        display: "standalone",

        start_url: "/",

        icons: [
          {
            src: "/vite.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
      },

      workbox: {
        navigateFallback: "/index.html",
        globPatterns: [
          "**/*.{js,css,html,svg,png,ico}",
        ],
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],
});
