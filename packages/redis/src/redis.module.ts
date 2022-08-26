import { DynamicModule, FactoryProvider, Module, ModuleMetadata, Provider } from '@nestjs/common';
import { RedisOptions } from 'ioredis';
import { SoundcoreRedisService } from './services/redis.service';
import { createRedisConnectionProvider, createRedisConnectionProviders, createRedisConnectionProvidersAsync, createRedisOptionsProvider, createRedisOptionsProviderAsync } from './utils';

export interface RedisAsyncOptions extends Pick<ModuleMetadata, 'imports'>, Pick<FactoryProvider, 'inject'> {
  useFactory: (...args: any[]) => Promise<RedisOptions> | RedisOptions;
} 

export interface RegisterConnectionOptions {
  /**
   * Provide the name of the new connection.
   */
  name: string;

  /**
   * Define redis connection options like
   * host and port. This will overwrite the values
   * provided by the mdoule registration using forRoot().
   */
  connectionOptions?: RedisOptions
}

@Module({})
export class SoundcoreRedisModule {

  /**
   * Use this to import the module globally
   * and activate the redis functionality. This will register
   * 3 different connections for you to use. If you need more,
   * please see how registerConnections() works.
   * @param options Connection options
   */
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

  /**
   * Use this to import the module globally
   * and activate the redis functionality. This will register
   * 3 different connections for you to use. If you need more,
   * please see how registerConnections() works.
   * @param options Connection options
   */
  public static async forRootAsync(options: RedisAsyncOptions): Promise<DynamicModule> {
    const redisOptionsProvider: Provider = createRedisOptionsProviderAsync(options);
    const redisConnectionProviders: Provider[] = createRedisConnectionProvidersAsync(options);

    return {
      module: SoundcoreRedisModule,
      global: true,
      imports: options.imports,
      providers: [
        SoundcoreRedisService,
        redisOptionsProvider,
        ...redisConnectionProviders
      ],
      exports: [
        redisOptionsProvider,
        ...redisConnectionProviders
      ]
    }
  }

  /**
   * Use this to register new connections inside NestJS modules
   * @param options Connection options
   */
  public static registerConnections(options: RegisterConnectionOptions[]): DynamicModule {
    const providers: Provider[] = [];

    for(const registerConnection of options) {
      providers.push(createRedisConnectionProvider(registerConnection));
    }

    return {
      module: SoundcoreRedisModule,
      global: false,
      providers: [
        ...providers
      ],
      exports: [
        ...providers
      ]
    }
  }

}
