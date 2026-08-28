import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/soloist': 'http://127.0.0.1:8080',
      '/api': 'http://127.0.0.1:8080'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022'
  },
  esbuild: {
    target: 'es2022'
  }
})
