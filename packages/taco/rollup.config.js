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

    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      nodeResolve(),
      isDEV ? null : terser(),
      typescript(),
    ],
    output: {
      file: `dist/taco.umd.${isDEV ? '' : 'min.'}js`,
      format: 'umd',
      name: 'taco',
      esModule: false,
      exports: 'named',
      sourcemap: isDEV,
    },
  },
  // ESM
  {
    input,
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      nodeResolve(),
      isDEV ? null : terser(),
      typescript(),
    ],
    output: {
      file: `dist/taco.esm.${isDEV ? '' : 'min.'}js`,
      format: 'esm',
      exports: 'named',
      sourcemap: isDEV,
    },
  },
];