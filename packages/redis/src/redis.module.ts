import { DynamicModule, Module } from '@nestjs/common';
import { RedisOptions } from 'ioredis';
import { SoundcoreRedisService } from './services/redis.service';
import { createRedisConnectionProviders, createRedisOptionsProvider } from './utils';

@Module({})
export class SoundcoreRedisModule {

  public static forRoot(options: RedisOptions): DynamicModule {

    const redisOptionsProvider = createRedisOptionsProvider(options);
    const redisConnectionProvider = createRedisConnectionProviders(options);

    return {
      module: SoundcoreRedisModule,
      global: true,
      providers: [
        redisOptionsProvider,
        ...redisConnectionProvider,
        SoundcoreRedisService
      ],
      exports: [
        redisOptionsProvider,
        ...redisConnectionProvider
      ]
    }
  }

}
