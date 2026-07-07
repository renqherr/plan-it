import { defineConfig } from 'vite';

// Repo is served at https://renqherr.github.io/plan-it/ on GitHub Pages,
// so assets must resolve under the /plan-it/ base path.
export default defineConfig({
  base: '/plan-it/',
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
});
