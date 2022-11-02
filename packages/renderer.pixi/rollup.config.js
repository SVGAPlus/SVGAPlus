import typescript from 'rollup-plugin-typescript2'
import del from 'rollup-plugin-delete'
import terser from '@rollup/plugin-terser'

export default {
  input: './lib/index.ts',

  output: [
    {
      file: './dist/index.js',
      format: 'umd',
      name: 'SVGAPlusPixiRenderer',
      globals: {
        'pixi.js': 'PIXI'
      }
    },
    {
      file: './dist/index.esm.js',
      format: 'es'
    }
  ],

  external: [
    'pixi.js'
  ],

  plugins: [
    typescript(),

    del({
      targets: 'dist/*'
    }),

    terser()
  ]
}
