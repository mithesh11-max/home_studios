import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
    watch: {
      // Ignore zip/archive files and any file that might be held open by the OS or IDE
      ignored: ["**/*.zip", "**/*.rar", "**/*.7z", "**/*.tar", "**/*.gz"],
    },
  },
});
