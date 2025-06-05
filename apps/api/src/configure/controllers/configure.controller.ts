import { Controller, Post } from "@nestjs/common";
import { FactoryResetService } from "../services/factory-reset.service";

@Controller("configure")
export class ConfigureController {
  constructor(private readonly factoryResetService: FactoryResetService) {}

  @Post("reset")
  public async resetAll() {
    return this.factoryResetService.resetAll();
  }

  @Post("reset/database")
  public async resetDatabase() {
    return this.factoryResetService.resetDatabase();
  }

  @Post("reset/search-engine")
  public async resetSearchEngine() {
    return this.factoryResetService.resetMeilisearch();
  }
}
