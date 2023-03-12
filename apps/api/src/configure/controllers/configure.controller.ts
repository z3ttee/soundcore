import { Controller, Post } from "@nestjs/common";
import { Roles } from "../../authentication/decorators/role.decorator";
import { ROLE_ADMIN } from "../../constants";
import { FactoryResetService } from "../services/factory-reset.service";

@Controller("configure")
export class ConfigureController {

    constructor(
        private readonly factoryResetService: FactoryResetService
    ) {}

    @Roles(ROLE_ADMIN)
    @Post("reset")
    public async resetAll() {
        return this.factoryResetService.resetAll();
    }

    @Roles(ROLE_ADMIN)
    @Post("reset/database")
    public async resetDatabase() {
        return this.factoryResetService.resetDatabase();
    }

    @Roles(ROLE_ADMIN)
    @Post("reset/search-engine")
    public async resetSearchEngine() {
        return this.factoryResetService.resetMeilisearch();
    }

}