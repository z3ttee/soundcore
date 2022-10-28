import { Provider } from "@nestjs/common";
import Redis, { RedisOptions } from "ioredis";
import { SOUNDCORE_REDIS_OPTIONS } from "./constants";
import { RedisSub } from "./entities";
import { RedisAsyncOptions, RegisterConnectionOptions } from "./redis.module";

/**
 * Create a new redis options provider to use
 * in forRoot()
 * @param options Redis options to configure the options injectable
 * @returns Provider
 */
export function createRedisOptionsProvider(options: RedisOptions): Provider {
    return {
      provide: SOUNDCORE_REDIS_OPTIONS,
      useValue: options
    }
}

/**
 * Create a new redis options provider asynchronously to use
 * in forRootAsync()
 * @param asyncOptions Redis options to configure the options injectable
 * @returns Provider
 */
export function createRedisOptionsProviderAsync(asyncOptions: RedisAsyncOptions): Provider {
    return {
      provide: SOUNDCORE_REDIS_OPTIONS,
      useFactory: async (...args) => {
            return await asyncOptions.useFactory(args);
      },
      inject: asyncOptions.inject
    }
}

/**
 * Create new redis connection.
 * @param options Redis connection options
 */
function createRedisConnection(options: RedisOptions) {
    return new Redis(options);    
}

export function createRedisConnectionProviders(options: RedisOptions): Provider[] {
    return [
        {
            provide: RedisSub,
            useValue: createRedisConnection(options)
        },
        {
            provide: Redis,
            useValue: createRedisConnection(options)
        }
    ]
}

export function createRedisConnectionProvidersAsync(asyncOptions: RedisAsyncOptions): Provider[] {
    const inject = asyncOptions.inject;

    const useFactory = async (...args) => {
        const options: RedisOptions = await asyncOptions.useFactory(args);
        return createRedisConnection(options);
    }

    return [
        {
            provide: RedisSub,
            useFactory,
            inject,
        },
        {
            provide: Redis,
            useFactory,
            inject,
        }
    ]
}

export function createRedisConnectionProvider(options: RegisterConnectionOptions): Provider {
    return {
        provide: options.name,
        useValue: createRedisConnection(options.connectionOptions)
    }    
}