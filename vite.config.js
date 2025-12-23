import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
    server: {
    allowedHosts: [
      '5ee926928e20ab42-150-228-105-110.serveousercontent.com'
    ]
  }
})

