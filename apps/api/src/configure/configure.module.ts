import { Module } from "@nestjs/common";
import { ConfigureController } from "./controllers/configure.controller";
import { FactoryResetService } from "./services/factory-reset.service";

@Module({
    controllers: [
        ConfigureController
    ],
    providers: [
        FactoryResetService
    ]
})
export class ConfigureModule {}