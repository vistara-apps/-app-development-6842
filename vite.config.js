import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress warnings about pure annotations in node_modules
        if (warning.code === 'INVALID_ANNOTATION' && warning.id?.includes('node_modules')) {
          return
        }
        warn(warning)
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion', 'react-hot-toast'],
          charts: ['recharts'],
          crypto: ['@privy-io/react-auth'],
          api: ['axios', 'openai', '@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
})
