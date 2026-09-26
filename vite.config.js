import { defineConfig } from 'vite';

// Relative base so the build works on GitHub Pages or any sub-path.
// three.js alone is ~600 kB minified, so raise the size warning accordingly.
export default defineConfig({ base: './', build: { chunkSizeWarningLimit: 900 } });
