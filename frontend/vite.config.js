import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build optimizations
  build: {
    // Enable minification
    minify: 'terser',
    
    // Terser options for better compression
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['framer-motion', '@headlessui/react', '@heroicons/react'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'yup'],
          'utils-vendor': ['axios', 'react-hot-toast'],
        },
      },
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Enable source maps for debugging (disable in production)
    sourcemap: false,
  },
  
  // Development server optimizations
  server: {
    // Enable HMR
    hmr: true,

    // Port configuration
    port: 5173,

    // Handle client-side routing in development
    historyApiFallback: true,

    // Proxy API requests during development
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'framer-motion',
      '@headlessui/react',
      '@heroicons/react/24/outline',
      '@heroicons/react/24/solid',
      'react-hook-form',
      'react-hot-toast',
    ],
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@context': resolve(__dirname, 'src/context'),
    },
  },
  
  // CSS optimization
  css: {
    devSourcemap: true,
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
  },
})
