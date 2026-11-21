import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

// Duas páginas: o site (index.html) e o app (app/index.html)
export default defineConfig({
  build: {
    rollupOptions: { input: { site: r('./index.html'), app: r('./app/index.html') } },
  },
});
