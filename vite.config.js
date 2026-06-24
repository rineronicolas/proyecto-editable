import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    allowedHosts: [
      'rubbed-unsocial-galore.ngrok-free.dev' // Agregá esta línea exactamente como dice el error
    ]
  }
})