import { DynamicModule, Module } from "@nestjs/common";
import { SoundcoreRedisModule } from "@soundcore/redis";
import { RedisOptions } from "ioredis";
import { createHeartbeatServiceProviders } from "../shared/utils";
import { HeartbeatClientService } from "./services/heartbeat-client.service";

export interface HeartbeatClientOptions {
    /**
     * Name of ID of the client.
     * This will be send with the heartbeat packet so that
     * the heartbeat server can identify the service.
     */
    identifier: string;
    redis: RedisOptions,


    /**
     * Time in milliseconds a heartbeat client will send a heartbeat packet. 
     * This value should be larger than the timeout value set in the server. 
     * Otherwise it will always time out.
     * @default 10000
     */
    interval?: number

    /**
     * Define static data that should
     * be send as additional payload with the
     * heartbeat packet. On the server side, you can then
     * handle the heartbeat packet's additional payload inside
     * a method decorated with @OnHeartbeat()
     * @default null
     */
    staticPayload?: any;
}

@Module({})
export class HeartbeatClientModule {

    public static forRoot(options: HeartbeatClientOptions): DynamicModule {

        const heartbeatOptionsProvider = createHeartbeatServiceProviders<HeartbeatClientOptions>(options);

        return {
            module: HeartbeatClientModule,
            imports: [
                SoundcoreRedisModule.forRoot(options.redis)
            ],
            providers: [
                HeartbeatClientService,
                heartbeatOptionsProvider
            ],
            exports: [
                SoundcoreRedisModule,
                heartbeatOptionsProvider
            ]
        }
    }

}