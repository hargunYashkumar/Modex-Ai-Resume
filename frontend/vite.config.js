import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },

    // Dev server
    server: {
      port: 3000,
      host: true,               // expose on LAN for Docker
      proxy: {
        '/api': {
          target:       env.VITE_API_TARGET || 'http://localhost:5000',
          changeOrigin: true,
          secure:       false,
        },
      },
    },

    // Preview server (for testing prod build locally)
    preview: {
      port: 4173,
      proxy: {
        '/api': {
          target:       env.VITE_API_TARGET || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },

    // Production build
    build: {
      outDir:    'dist',
      sourcemap: mode !== 'production',
      // Warn when chunks exceed 1MB
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React runtime
            'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
            // Animation library (large — separate chunk)
            'vendor-motion': ['framer-motion'],
            // PDF export (large — lazy-loaded but still chunk it)
            'vendor-pdf':    ['jspdf', 'html2canvas'],
            // State management
            'vendor-state':  ['zustand'],
          },
        },
      },
    },

    // Optimise dev dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'framer-motion'],
    },
  }
})
