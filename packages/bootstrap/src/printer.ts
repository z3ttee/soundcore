import path from "node:path";
import fs from "node:fs";

export class Printer {

    public static async printLogo(): Promise<void> {
        return new Promise((resolve) => {
            const logofilepath = path.resolve(__dirname, "..", "assets", "logo_ascii.txt");

            if(fs.existsSync(logofilepath)) {
                fs.readFile(logofilepath, (err, data) => {
                    if(err) return;
                    console.log(" ");
                    console.log(`${data.toString("ascii")}`);
                    console.log(" ");
                    resolve();
                });
            } else {
                resolve();
            }
        })
    }

    public static async printBootstrapInfo(appName: string, buildInfoFilepath: string = "./buildinfo.json"): Promise<void> {
        return new Promise((resolve) => {
            const filepath = path.resolve(process.cwd(), buildInfoFilepath);

            const info: { name: string, version: string, date: number } = {
                name: appName,
                version: require(path.resolve(process.cwd(), "package.json"))?.version,
                date: Date.now()
            };

            if(fs.existsSync(filepath)) {
                const data = fs.readFileSync(filepath);
                if(data) {
                    const json = JSON.parse(data.toString("utf8"));

                    info.version = json?.version;
                    info.date = json?.date;
                }
            }

            console.log(`${appName} - v${info.version} (Built at ${new Date(info.date).toLocaleDateString()})`);
            resolve();
        })
    }

    public static async printCopyright() {
        const year = new Date(Date.now()).getFullYear();

        console.log(" ");
        console.log(`(c) 2022${year > 2022 ? '-' + year : ''} TSAlliance | Starting application with TSAlliance NestJS Bootstrapper`);
        console.log("https://www.tsalliance.eu | https://github.com/z3ttee");
        console.log(" ");
    }

}