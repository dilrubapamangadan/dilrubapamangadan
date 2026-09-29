import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Relative base so the build works on GitHub Pages or any sub-path.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
