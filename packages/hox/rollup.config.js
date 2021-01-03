import typescript from 'rollup-plugin-typescript2';
import {
  nodeResolve
} from '@rollup/plugin-node-resolve';
import {
  terser
} from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';

const input = ['./lib/index.ts'];
const isDEV = process.env.NODE_ENV !== 'production';

export default [
  // UMD
  {
    input,
    external: ['@tacopie/taco'],

    plugins: [nodeResolve(), isDEV ? null : terser(), typescript()],
    output: {
      file: `dist/taco-hox.umd.${isDEV ? '' : 'min.'}js`,
      format: 'umd',
      name: 'taco-hox',
      esModule: false,
      exports: 'named',
      sourcemap: isDEV,
    },
  },
  // ESM
  {
    input,
    external: ['@tacopie/taco'],

    plugins: [
      replace({
        '@tacopie/taco': JSON.stringify('/packages/taco/dist/taco.esm.min.js'),
      }), nodeResolve(), isDEV ? null : terser(), typescript()
    ],
    output: {
      file: `dist/taco-ui.esm.${isDEV ? '' : 'min.'}js`,
      format: 'esm',
      exports: 'named',
      sourcemap: isDEV,
    },
  },
];