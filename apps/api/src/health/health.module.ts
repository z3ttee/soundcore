import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { HEALTH_SERVICE } from "@soundcore/constants";
import { HealthController } from "./controllers/health.controller";
import { HealthService } from "./services/health.service";

@Module({
    controllers: [
        HealthController
    ],
    providers: [
        HealthService
    ],
    imports: [
        ClientsModule.register([
            { name: HEALTH_SERVICE, transport: Transport.REDIS, options: {
                host: process.env.REDIS_HOST || "localhost",
                port: parseInt(process.env.REDIS_PORT) || 6379,
                password: process.env.REDIS_PASS || undefined
            }}
        ])
    ],
    exports: [
        HealthService
    ]
})
export class HealthModule {}