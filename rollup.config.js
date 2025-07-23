import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/components/PrintEditor.ts',
  output: {
    file: 'dist/PrintEditor.umd.js',
    format: 'umd',
    name: 'PrintEditor',
    globals: {},
  },
  plugins: [typescript()],
};
