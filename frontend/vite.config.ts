import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  server: {
    proxy: {
      // Any request starting with /api will be intercepted by Vite
      '/api': {
        target: 'https://glucolens-backend.onrender.com',
        changeOrigin: true, // This is what tricks the CORS policy
        secure: false,      // Set to false to avoid SSL cert errors in Codespaces
        
        // to see the proxy working in our terminal
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
        }
      }
    }
  }
})