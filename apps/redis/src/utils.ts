import { Provider } from "@nestjs/common";
import Redis, { RedisOptions } from "ioredis";
import { SOUNDCORE_REDIS_OPTIONS } from "./constants";

export function createRedisOptionsProvider(options: RedisOptions): Provider {
    return {
      provide: SOUNDCORE_REDIS_OPTIONS,
      useValue: options
    }
}

export function createRedisConnectionProvider(connection: Redis): Provider {
    return {
        provide: Redis,
        useValue: connection
    }
}

export function createRedisConnection(options: RedisOptions) {
    return new Redis(options);    
}