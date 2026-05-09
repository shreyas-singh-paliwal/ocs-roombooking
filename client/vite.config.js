import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 2712,
    proxy: {
      '/api': {
        target: 'http://localhost:2711',
        changeOrigin: true
      }
    }
  },
  // This replaces /api calls with the Render URL in production
  define: {
    __API_URL__: JSON.stringify(
      mode === 'production' 
        ? 'https://your-render-app.onrender.com' 
        : ''
    )
  }
}))