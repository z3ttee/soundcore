import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/**/*"],
  bundle: false,
  minify: true,
  format: "esm",
  target: "es2020",
  minifyWhitespace: true,
  outdir: "dist/esm",
  treeShaking: true,
  tsconfig: "tsconfig.json",
  platform: "browser"
});
