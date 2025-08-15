import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  build: {
    target: 'es2015'
  }
})
