import { DynamicModule, FactoryProvider, Module, ModuleMetadata } from "@nestjs/common";
import { SoundcoreRedisModule } from "@soundcore/redis";
import { RedisOptions } from "ioredis";
import { createHeartbeatServiceProviders, createHeartbeatServiceProvidersAsync } from "../shared/utils";
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

export interface HeartbeatClientAsyncOptions extends Pick<ModuleMetadata, "imports">, Pick<FactoryProvider, "inject"> {
    useFactory: (...args: any[]) => Promise<HeartbeatClientOptions> | HeartbeatClientOptions;
}

@Module({})
export class HeartbeatClientModule {

    public static forRoot(options: HeartbeatClientOptions): DynamicModule {
        const heartbeatOptionsProvider = createHeartbeatServiceProviders(options);

        return {
            module: HeartbeatClientModule,
            global: true,
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

    public static async forRootAsync(asyncOptions: HeartbeatClientAsyncOptions): Promise<DynamicModule> {
        const heartbeatOptionsProvider = createHeartbeatServiceProvidersAsync(asyncOptions);

        return {
            module: HeartbeatClientModule,
            global: true,
            imports: [
                ...(asyncOptions.imports || []),
                SoundcoreRedisModule.forRootAsync({
                    useFactory: async (...args) => {
                        const options: HeartbeatClientOptions = await asyncOptions.useFactory(args);
                        return options.redis;
                    },
                    imports: asyncOptions.imports,
                    inject: asyncOptions.inject
                })
            ],
            providers: [
                heartbeatOptionsProvider,
                HeartbeatClientService
            ],
            exports: [
                SoundcoreRedisModule,
                heartbeatOptionsProvider
            ]
        }
    }

}