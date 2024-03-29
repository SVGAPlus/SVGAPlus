import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@svgaplus/core': path.resolve(__dirname, '../packages/core/src/index.ts'),
      '@svgaplus/proto': path.resolve(__dirname, '../packages/proto'),
      '@svgaplus/renderer.pixi': path.resolve(__dirname, '../packages/renderer.pixi/lib/index.ts')
    }
  }
})
