import { Injectable } from "@nestjs/common";
import fs from "fs";
import path from "path";

export class ApplicationBuildInfo {
    public version: string;
    public builtAt: number;
    public buildId: string;
}

@Injectable()
export class AppService {
    private _info: ApplicationBuildInfo;

    constructor() {
        this.readBuildInfo();
    }

    public async getApplicationBuildInfo(): Promise<ApplicationBuildInfo> {
        return this._info;
    }

    private readBuildInfo() {
        const buildInfoFile = path.resolve("./buildinfo.json");
        const alternateInfoFile = path.resolve("./dist/buildinfo.json");

        let buffer: Buffer;
        try {
            if(fs.existsSync(buildInfoFile)) {
                buffer = fs.readFileSync(buildInfoFile);
            } else {
                if(fs.existsSync(alternateInfoFile)) {
                    buffer = fs.readFileSync(alternateInfoFile);
                }
            }
        } catch {}

        if(!buffer) {
            this._info = {
                version: "development",
                buildId: "development-build-id",
                builtAt: new Date().getTime()
            }
            return;
        }

        const object = JSON.parse(buffer.toString());
        this._info = {
            version: object["version"],
            buildId: object["id"],
            builtAt: parseInt(object["date"])
        }
    }

}