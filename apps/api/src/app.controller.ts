import { Controller, Get } from "@nestjs/common";
import { ApplicationBuildInfo, AppService } from "./app.service";

@Controller("")
export class AppController {

    constructor(private readonly service: AppService) {}

    @Get("/")
    public async getBuildInfo(): Promise<ApplicationBuildInfo> {
        return this.service.getApplicationBuildInfo();
    }

}