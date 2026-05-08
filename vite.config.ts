import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',   // GitHub Pages 兼容：使用相对路径加载资源
  plugins: [
    react(),
    tailwindcss(),
  ],
})
