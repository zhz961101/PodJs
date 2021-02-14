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

import pkg from './package.json'

const plugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }),
  nodeResolve(),
  typescript({
    useTsconfigDeclarationDir: true
  }),
  isDEV ? null : terser({
    format: {
      comments: RegExp(`${pkg.name}`)
    }
  }),
];

export default [
  // UMD
  {
    input,
    external: ['@tacopie/taco'],

    plugins,
    output: {
      file: `dist/taco-ui.umd.${isDEV ? '' : 'min.'}js`,
      format: 'umd',
      name: 'taco-ui',
      esModule: false,
      exports: 'named',
      sourcemap: isDEV,
    },
  },
  // ESM
  {
    input,
    external: ['@tacopie/taco'],

    plugins,
    output: {
      file: `dist/taco-ui.esm.${isDEV ? '' : 'min.'}js`,
      format: 'esm',
      exports: 'named',
      sourcemap: isDEV,
    },
  },
];