import { Controller, Get } from "@nestjs/common";
import { ApplicationInfo, AppService } from "./app.service";
import { Environment } from "@repo/bootstrap";

@Controller("")
export class AppController {

    constructor(private readonly service: AppService) { }

    @Get("")
    public async getBuildInfo(): Promise<ApplicationInfo> {
        return {
            build: await this.service.getApplicationBuildInfo(),
            isDockerized: Environment.isDockerized
        }
    }

}