# Mediacore UI
This library contains all the ui components used in the Mediacore frontend.

## Import Tailwind Config
Importing the library's tailwindcss config is simple:
1. Follow the instructions of the official tailwindcss installation guide.
2. Open the file `tailwind.config.js`.
3. Now modify the config file using the following values:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ...
  presets: [
    // This is the important part
    require("@mediacore/ui/tailwind")
  ],
  // ...
}
```

## Import CSS
Importing global css styles is as simple as importing `@mediacore/ui/styles` in your global css file. 