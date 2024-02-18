import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

/** @type {import('rollup').RollupOptions} */
export default {
    input: 'src/index.ts',
    external: ['@nestjs/common'],
    output: [
        {
            file: "dist/index.cjs",
            format: 'cjs',
            exports: 'named',
            sourcemap: true,
        },
        {
            file: "dist/index.es.mjs",
            format: 'es',
            exports: 'named',
            sourcemap: true,
        }
    ],
    plugins: [
        json(),
        typescript({
            outDir: "dist/",
            declaration: true,
        })
    ]
}