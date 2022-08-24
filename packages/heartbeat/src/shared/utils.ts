import { Provider } from "@nestjs/common";
import { HEARTBEAT_OPTIONS } from "../constants";
import { HeartbeatOptions } from "../server/heartbeat-server.module";

export function createHeartbeatServiceProviders<T = HeartbeatOptions>(options: T): Provider {
    return {
        provide: HEARTBEAT_OPTIONS,
        useValue: options
    }
}