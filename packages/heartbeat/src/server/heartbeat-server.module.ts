import { DynamicModule, FactoryProvider, Module, ModuleMetadata } from "@nestjs/common";
import { SoundcoreRedisModule } from "@soundcore/redis";
import { RedisOptions } from "ioredis";
import { HeartbeatServerService } from "./services/heartbeat-server.service";
import { createHeartbeatServiceProviders, createHeartbeatServiceProvidersAsync } from "../shared/utils";

export interface HeartbeatServerOptions {
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

// export interface HeartbeatServerAsyncOptions extends  {
//     redis: RedisOptions,

//     /**
//      * Time in milliseconds a heartbeat client will be marked as offline
//      * after not sending a heartbeat packet. This value should be smaller
//      * than the interval value set in the client. Otherwise it will
//      * always time out.
//      * @default 15000
//      */
//     timeout?: number
// }

export interface HeartbeatServerAsyncOptions extends Pick<ModuleMetadata, "imports">, Pick<FactoryProvider, "inject"> {
    useFactory: (...args: any[]) => Promise<HeartbeatServerOptions> | HeartbeatServerOptions;
}

@Module({})
export class HeartbeatServerModule {

    public static forRoot(options: HeartbeatServerOptions): DynamicModule {
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

    public static async forRootAsync(asyncOptions: HeartbeatServerAsyncOptions): Promise<DynamicModule> {
        const heartbeatOptionsProvider = createHeartbeatServiceProvidersAsync(asyncOptions);

        return {
            module: HeartbeatServerModule,
            global: true,
            imports: [
                ...(asyncOptions.imports || []),
                SoundcoreRedisModule.forRootAsync({
                    useFactory: async (...args) => {
                        const options: HeartbeatServerOptions = await asyncOptions.useFactory(args);
                        return options.redis;
                    },
                    imports: asyncOptions.imports,
                    inject: asyncOptions.inject
                })
            ],
            providers: [
                heartbeatOptionsProvider,
                HeartbeatServerService
            ],
            exports: [
                HeartbeatServerService,
                SoundcoreRedisModule,
                heartbeatOptionsProvider
            ]
        }
    }

}