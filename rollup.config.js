// rollup.config.js
import { terser } from 'rollup-plugin-terser'

export default {
  input: `src/magnifier.js`,
  output: [
    {
      file: `dist/openseadragonmagnifier.js`,
      format: 'umd',
      name: 'magnifier',
      sourcemap: true,
    },
    {
      file: `module/openseadragonmagnifier.js`,
      format: 'esm',
      name: 'magnifier',
      sourcemap: true,
    },
  ],
  plugins: [
    terser(),
  ],
}
