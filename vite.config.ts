import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works from any folder (GitHub Pages project site, subpath, etc.).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: true, port: 5174 },
})
