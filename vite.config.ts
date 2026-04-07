import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration Vite minimale: React pour le JSX et port fixe pour les habitudes de dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
