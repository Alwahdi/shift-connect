import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@syndeocare/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@syndeocare/config": path.resolve(__dirname, "../../packages/config/src"),
      "@syndeocare/auth": path.resolve(__dirname, "../../packages/auth/src"),
      "@syndeocare/i18n": path.resolve(__dirname, "../../packages/i18n/src"),
      "@syndeocare/database": path.resolve(__dirname, "../../packages/database/src"),
    },
  },
  build: {
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-popover"],
        },
      },
    },
  },
}));
