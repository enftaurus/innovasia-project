import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Student Sanctuary",
        short_name: "Sanctuary",
        start_url: ".",
        display: "standalone",
        background_color: "#edf2f7",
        theme_color: "#2563eb",
        icons: [
          {
            src:
              "data:image/svg+xml;utf8," +
              encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%232563eb'/><text x='50' y='58' font-size='56' text-anchor='middle' fill='white'>🧠</text></svg>`),
            sizes: "192x192",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
});
