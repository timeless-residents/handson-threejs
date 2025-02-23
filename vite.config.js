// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: '/handson-threejs/',
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        scene: "scene.html",
      },
    },
  },
});
