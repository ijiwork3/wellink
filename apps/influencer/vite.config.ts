import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 3005 },
  resolve: {
    alias: {
      '@wellink/ui/theme.css': path.resolve(__dirname, '../../packages/ui/src/theme.css'),
      '@wellink/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
    },
  },
})
