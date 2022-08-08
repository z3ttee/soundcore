const path = require("node:path");
const fs = require("node:fs");
const packageJson = require("../package.json");
const { randomBytes } = require("node:crypto");

function bundleInfo() {
    const dstfile = path.join(process.cwd(), "dist", "buildinfo.json");
    const buildinfo = {
        date: Date.now(),
        version: packageJson.version,
        id: randomBytes(16).toString("hex")
    }

    fs.writeFile(dstfile, JSON.stringify(buildinfo, null, 2), (err) => {
        if(err) {
            console.error(`Could not write .env file to dist: ${err.message}`);
            return;
        }

        console.log(`Successfully created buildinfo.json file (${dstfile})`);
        console.log(`\n[]===================================[]\n`);
        console.log(` Build date: ${new Date(buildinfo.date).toUTCString()}`);
        console.log(` Build version: ${buildinfo.version}`);
        console.log(` Build id: ${buildinfo.id}\n`);
        console.log(`[]===================================[]`);

    })

}

bundleInfo();