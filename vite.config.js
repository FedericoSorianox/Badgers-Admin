import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Suppress deprecation warnings
        quietDeps: true,
        // Use modern Sass features
        sassOptions: {
          outputStyle: 'compressed',
          includePaths: ['node_modules'],
        },
      },
    },
  },
})
