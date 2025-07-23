import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:4000', // Docker service name
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      }
    }
  }
}