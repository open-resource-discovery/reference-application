import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const rootDirectory = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: path.resolve(rootDirectory, 'ui'),
  publicDir: path.resolve(rootDirectory, 'static'),
  build: {
    outDir: path.resolve(rootDirectory, 'dist/ui'),
    emptyOutDir: true,
    target: 'esnext',
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})
