import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
import path from "node:path";
import autoprefixer from "autoprefixer";

const packageJson = require("./package.json");

/** @type {import('rollup').RollupOptions} */
const rollupConfig = {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true
      }
    ],
    plugins: [
        // Prevent rollup from bundling external peer deps
        peerDepsExternal(),
        // Efficiently bundles third party deps
        resolve(),
        // Enables transpilation into CommonJS
        commonjs(),
        // Transpile typescript code into JS
        typescript({ useTsconfigDeclarationDir: true }),
        // Transform scss to css
        postcss({
          minimize: true,
          extract: path.resolve("./dist/styles/styles.css"),
          plugins: [
            autoprefixer
          ]
        }),
    ]
}

export default rollupConfig;