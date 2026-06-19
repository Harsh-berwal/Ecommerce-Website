import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
