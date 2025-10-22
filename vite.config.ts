import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Removed runtime error overlay plugin completely
  ],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      buffer: 'buffer',
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      external: [],
    },
  },
  server: {
    hmr: {
      overlay: false, // Disable error overlay
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
