import { Controller, Get } from "@nestjs/common";
import { Environment } from "@soundcore/common";
import { ApplicationInfo, AppService } from "./app.service";

@Controller("")
export class AppController {

    constructor(private readonly service: AppService) {}

    @Get("")
    public async getBuildInfo(): Promise<ApplicationInfo> {
        return {
            build: await this.service.getApplicationBuildInfo(),
            isDockerized: Environment.isDockerized
        }
    }

}