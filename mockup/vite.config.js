import { defineConfig } from 'vite';

// base: './' so the built page works from any folder (GitHub Pages under /pokju-edu/mockup/dist/, or a file server)
export default defineConfig({
  base: './',
  build: { target: 'es2020', chunkSizeWarningLimit: 1200 }
});
