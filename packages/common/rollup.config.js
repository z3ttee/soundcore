import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

const plugins = [
    json(),
    typescript({
        outDir: "dist/",
        declaration: true,
    })
]

/** @type {import('rollup').RollupOptions} */
export default [
    {
        input: 'src/node.ts',
        external: ['@nestjs/common'],
        output: [
            {
                file: "dist/index.cjs",
                format: 'cjs',
                exports: 'named',
                sourcemap: true,
            }
        ],
        plugins: plugins
    },
    {
        input: 'src/browser.ts',
        output: [
            {
                file: "dist/index.es.mjs",
                format: 'es',
                exports: 'named',
                sourcemap: true
            }
        ],
        plugins: plugins
    }
]