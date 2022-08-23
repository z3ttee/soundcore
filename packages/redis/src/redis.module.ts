import { DynamicModule, Module } from '@nestjs/common';
import { RedisOptions } from 'ioredis';
import { SoundcoreRedisService } from './services/redis.service';
import { createRedisConnection, createRedisConnectionProvider, createRedisOptionsProvider } from './utils';

@Module({})
export class SoundcoreRedisModule {

  public static forRoot(options: RedisOptions): DynamicModule {

    const redisOptionsProvider = createRedisOptionsProvider(options);
    const redisConnectionProvider = createRedisConnectionProvider(createRedisConnection(options));

    return {
      module: SoundcoreRedisModule,
      providers: [
        redisOptionsProvider,
        redisConnectionProvider,
        SoundcoreRedisService
      ],
      exports: [
        redisOptionsProvider,
        redisConnectionProvider
      ]
    }
  }

}
