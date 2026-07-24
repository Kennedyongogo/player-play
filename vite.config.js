import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        cleanupOutdatedCaches: true,
      },
      includeAssets: ["favicon.ico", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Battlegrounds HQ Player",
        short_name: "BGHQ Player",
        description: "Player portal for APAC South tournaments",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#000000",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
    svgr(),
  ],
  server: {
    port: 5174,
    host: true,
    open: false,
    strictPort: true,
    hmr: { overlay: false },
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true, secure: false },
      "/uploads": { target: "http://localhost:4000", changeOrigin: true, secure: false },
    },
  },
});
