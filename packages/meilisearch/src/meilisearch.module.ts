import { ConfigurableModuleAsyncOptions, DynamicModule, Logger, Module } from "@nestjs/common";
import { MeilisearchRootOptions } from "./options";
import { ConfigurableMeilisearchModule, MODULE_OPTIONS_TOKEN } from "./meilisearch.module-definition";
import { LOGGER_LABEL } from "./constants";
import { createIndexesAsyncProviders, createMeilisearchClient } from "./utils/asyncProvider";
import { IndexSchema } from "./definitions";
import { MeiliClient } from "./entities/client.entity";

@Module({})
export class MeilisearchModule extends ConfigurableMeilisearchModule {

    public static forRoot(options: MeilisearchRootOptions): DynamicModule {
        const module = super.forRoot(options);

        return {
            ...module,
            global: true,
            providers: [
                ...module.providers,
                createMeilisearchClient([ MODULE_OPTIONS_TOKEN ], new Logger(LOGGER_LABEL)),
            ],
            exports: [
                MODULE_OPTIONS_TOKEN,
                MeiliClient,
            ]
        }
    }

    public static forRootAsync(options: ConfigurableModuleAsyncOptions<MeilisearchRootOptions>): DynamicModule {
        const module = super.forRootAsync(options);
        return {
            ...module,
            global: true,
            providers: [
                ...module.providers,
                createMeilisearchClient([ MODULE_OPTIONS_TOKEN ], new Logger(LOGGER_LABEL)),
            ],
            exports: [
                MODULE_OPTIONS_TOKEN,
                MeiliClient,                
            ]
        }
    }

    public static forFeature(indexes: IndexSchema[]): DynamicModule {
        const providers = createIndexesAsyncProviders([ MeiliClient, MODULE_OPTIONS_TOKEN ], indexes, new Logger(LOGGER_LABEL));

        return {
            module: MeilisearchModule,
            providers: [
                ...providers
            ],
            exports: [
                ...providers
            ]
        }
    }

}