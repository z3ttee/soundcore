const path = require("node:path");
const fs = require("node:fs");

function bundlePM2Ecosystem() {
    const filename = "ecosystem.config.js";
    console.log(`Creating ${filename} file...`);

    const srcfile = path.join(process.cwd(), filename);
    const dstfile = path.join(process.cwd(), "dist", filename);

    fs.access(srcfile, (err) => {
        if(err) {
            console.error(`Could not read ${filename} file: ${err.message}`);
            return;
        }

        fs.readFile(srcfile, (err, data) => {
            if(err) {
                console.error(`Could not read ${filename} file: ${err.message}`);
                return;
            }

            fs.writeFile(dstfile, data, (err) => {
                if(err) {
                    console.error(`Could not write ${filename} file to dist: ${err.message}`);
                    return;
                }

                console.log(`Successfully created ${filename} file (${dstfile})`);
            })
        })
    })
}

bundlePM2Ecosystem();