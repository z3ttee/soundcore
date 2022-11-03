const config = require("@soundcore/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...config,
  content: [
    "./src/**/*.{html,ts}",
    "./projects/**/*.{html,ts,scss,css}",
    "../../node_modules/@soundcore/ngx/dist/**/*.{html,ts,scss,css,mjs,js}",
    "../../node_modules/@soundcore/cdk/dist/**/*.{html,ts,scss,css,mjs,js}"
  ]
}
