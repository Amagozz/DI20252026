import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5173,
    strictPort: true
  },
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3000')
  }
})
