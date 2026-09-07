import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["three", "@react-three/fiber"],
  },
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three") || id.includes("node_modules/@react-three")) {
            return "threejs";
          }
          if (id.includes("node_modules/vanta") || id.includes("node_modules/p5")) {
            return "vanta-p5";
          }
          if (id.includes("node_modules/@tanstack")) {
            return "router";
          }
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 950,
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      // Ignore ZIP files, MP4 videos and sequence frames directory (large, static/locked assets)
      ignored: ["**/*.zip", "**/*.mp4", "**/public/sequence/**"],
    },
  },
  preview: {
    port: 4173,
    host: true,
  },
});
