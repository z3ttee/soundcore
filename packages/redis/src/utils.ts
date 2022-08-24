import { Provider } from "@nestjs/common";
import Redis, { RedisOptions } from "ioredis";
import { SOUNDCORE_REDIS_OPTIONS } from "./constants";
import { RedisPub, RedisSub } from "./entities";

export function createRedisOptionsProvider(options: RedisOptions): Provider {
    return {
      provide: SOUNDCORE_REDIS_OPTIONS,
      useValue: options
    }
}

export function createRedisConnectionProviders(options: RedisOptions): Provider[] {
    return [
        {
            provide: RedisSub,
            useValue: createRedisSubConnection(options)
        },
        {
            provide: RedisPub,
            useValue: createRedisPubConnection(options)
        },
        {
            provide: Redis,
            useValue: createRedisDefaultConnection(options)
        }
    ]
}

function createRedisDefaultConnection(options: RedisOptions) {
    return new Redis(options);    
}

function createRedisSubConnection(options: RedisOptions) {
    return new RedisSub(options);    
}

function createRedisPubConnection(options: RedisOptions) {
    return new RedisPub(options);    
}