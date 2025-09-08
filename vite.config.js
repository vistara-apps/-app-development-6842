import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
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
          privy: ['@privy-io/react-auth'],
          ui: ['lucide-react', 'framer-motion', 'react-hot-toast']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
