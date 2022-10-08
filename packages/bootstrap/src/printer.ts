import path from "node:path";
import fs from "node:fs";

export class Printer {

    public static async printLogo(): Promise<void> {
        return new Promise((resolve) => {
            const logofilepath = path.resolve(__dirname, "..", "assets", "logo_ascii.txt");

            const year = new Date(Date.now()).getFullYear();

            if(fs.existsSync(logofilepath)) {
                fs.readFile(logofilepath, (err, data) => {
                    if(err) return;
                    console.log(`\n${data.toString("ascii")}\n`);
                    console.log(`(c) 2022${year > 2022 ? '-' + year : ''} TSAlliance | Starting application with TSAlliance NestJS Bootstrapper\n`);
                    resolve();
                })
            }
        })
    }

}