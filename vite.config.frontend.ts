import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@/components": path.resolve(__dirname, "./client/src/components"),
      "@/hooks": path.resolve(__dirname, "./client/src/hooks"),
      "@/lib": path.resolve(__dirname, "./client/src/lib"),
      "@/pages": path.resolve(__dirname, "./client/src/pages"),
    },
  },
})
