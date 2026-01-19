import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // equivalente a --host
    watch: {
      usePolling: true,
      interval: 1000, // cada 1s chequea cambios
    },
    fs: {
      allow: ["."],
    },
  },
  optimizeDeps: {
    include: ['@heroui/react', '@heroui/theme']
  }
})
