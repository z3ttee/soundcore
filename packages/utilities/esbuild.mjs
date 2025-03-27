import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/**/*"],
  bundle: false,
  minify: true,
  format: "esm",
  target: "es6",
  minifyWhitespace: true,
  outdir: "dist/esm",
  treeShaking: true,
  tsconfig: "tsconfig.prod.json",
  platform: "browser"
});

await esbuild.build({
  entryPoints: ["src/**/*"],
  bundle: false,
  minify: true,
  format: "cjs",
  target: "es6",
  minifyWhitespace: true,
  outdir: "dist/cjs",
  treeShaking: true,
  tsconfig: "tsconfig.prod.json",
  platform: "node"
});
