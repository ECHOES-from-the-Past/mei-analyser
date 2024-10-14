import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@search': path.resolve(__dirname, './src/search'),
      '@panels': path.resolve(__dirname, './src/panels'),
      '@utility': path.resolve(__dirname, './src/utility'),
      '@functions': path.resolve(__dirname, './src/functions'),
    },
  },
  plugins: [svelte()],
})
