import { DynamicModule, Module } from "@nestjs/common";
import { SoundcoreRedisModule } from "@soundcore/redis";
import { RedisOptions } from "ioredis";
import { HeartbeatServerService } from "./services/heartbeat-server.service";
import { createHeartbeatServiceProviders } from "../shared/utils";

export interface HeartbeatOptions {
    redis: RedisOptions,

    /**
     * Time in milliseconds a heartbeat client will be marked as offline
     * after not sending a heartbeat packet. This value should be smaller
     * than the interval value set in the client. Otherwise it will
     * always time out.
     * @default 15000
     */
    timeout?: number
}

@Module({})
export class HeartbeatServerModule {

    public static forRoot(options: HeartbeatOptions): DynamicModule {

        const heartbeatOptionsProvider = createHeartbeatServiceProviders(options);

        return {
            module: HeartbeatServerModule,
            global: true,
            imports: [
                SoundcoreRedisModule.forRoot(options.redis)
            ],
            providers: [
                HeartbeatServerService,
                heartbeatOptionsProvider
            ],
            exports: [
                SoundcoreRedisModule,
                HeartbeatServerService,
                heartbeatOptionsProvider
            ]
        }
    }

}