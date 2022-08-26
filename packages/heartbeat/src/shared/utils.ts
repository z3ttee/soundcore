import { Provider } from "@nestjs/common";
import { HEARTBEAT_OPTIONS } from "../constants";
import { HeartbeatServerAsyncOptions, HeartbeatServerOptions } from "../server";

export function createHeartbeatServiceProviders(options: HeartbeatServerOptions): Provider {
    return {
        provide: HEARTBEAT_OPTIONS,
        useValue: options
    }
}

export function createHeartbeatServiceProvidersAsync(asyncOptions: HeartbeatServerAsyncOptions): Provider {
    return {
        provide: HEARTBEAT_OPTIONS,
        useFactory: async (...args) => {
            return await asyncOptions.useFactory(args);
        },
        inject: asyncOptions.inject
    }
}