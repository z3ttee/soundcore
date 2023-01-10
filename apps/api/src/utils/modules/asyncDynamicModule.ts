import { FactoryProvider, ModuleMetadata, Provider } from "@nestjs/common";

export interface AsyncDynamicModuleOptions<T> extends Pick<ModuleMetadata, 'imports'>, Pick<FactoryProvider, 'inject'> {
    useFactory: (...args: any[]) => Promise<T> | T;
}

export function createOptionsProviderFromAsync<T>(injectionToken: any, asyncOptions: AsyncDynamicModuleOptions<T>): Provider<T> {
    return {
        provide: injectionToken,
        useFactory: async (...args) => {
              return await asyncOptions.useFactory(args);
        },
        inject: asyncOptions.inject
    }
}