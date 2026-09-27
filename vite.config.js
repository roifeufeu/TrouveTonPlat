import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      workbox: {
 	 globPatterns: [],
 	 cleanupOutdatedCaches: true,
 	 skipWaiting: true,
 	 clientsClaim: true,
	},

      manifest: {
        name: "Projet Recettes",
        short_name: "Recettes",

        description:
          "Recherchez un plat et obtenez ses ingrédients et ses quantités.",

        theme_color: "#ea580c",
        background_color: "#fff7ed",

        display: "standalone",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
