const path = require("node:path");
const fs = require("node:fs");

function bundleEnvFile() {
    console.log("Creating production .env file...")
    const srcfile = path.join(process.cwd(), ".env");
    const dstfile = path.join(process.cwd(), "dist", ".env");

    fs.access(srcfile, (err) => {
        if(err) {
            console.error(`Could not read .env file: ${err.message}`);
            return;
        }

        fs.readFile(srcfile, (err, data) => {
            if(err) {
                console.error(`Could not read .env file: ${err.message}`);
                return;
            }

            fs.writeFile(dstfile, data, (err) => {
                if(err) {
                    console.error(`Could not write .env file to dist: ${err.message}`);
                    return;
                }

                console.log(`Successfully created .env file (${dstfile})`);
            })
        })
    })
}

bundleEnvFile();