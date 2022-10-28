const packageJson = require("../package.json");
const fs = require("node:fs");
const path = require("node:path");

function bundlePackageJson() {
    console.log("Creating reduced package.json...");

    const result = { ...packageJson };
    result.devDependencies = undefined;
    result.scripts = {
        "start": "node main.js"
    }

    const resultFilepath = path.join(process.cwd(), "dist", "package.json");

    fs.writeFile(resultFilepath, JSON.stringify(result, null, 2), "utf-8", (err) => {
        if(err) {
            console.error(`Error occured whilst writing package.json: ${err.message}`, err);
            return;
        }

        console.log(`Successfully created package.json (${resultFilepath})`);
    });
}


bundlePackageJson();