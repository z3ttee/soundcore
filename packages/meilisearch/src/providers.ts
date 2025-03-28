import { Logger, Provider } from "@nestjs/common";
import { AsyncMeilisearchRootOptions, MeilisearchRootOptions } from "./options";
import { MeiliClient } from "./entities/client.entity";
import { LOGGER_LABEL } from "./constants";
import { IndexSchema } from "./definitions";
import { pascalToSnakeCase } from "@repo/utilities";
import { syncIndexSchema } from "./utils/indexInit";

export const PROVIDER_TOKEN_ROOT_OPTIONS = "sc:meilisearch:module:rootoptions"
export const PROVIDER_TOKEN_FEATURE_OPTIONS = "sc:meilisearch:module:featureoptions"

export function createMeilisearchRootOptionsProvider(options: MeilisearchRootOptions): Provider {
    return {
        provide: PROVIDER_TOKEN_ROOT_OPTIONS,
        useValue: options
    }
}

export function createAsyncMeilisearchRootOptionsProvider(asyncOptions: AsyncMeilisearchRootOptions): Provider {
    return {
        provide: PROVIDER_TOKEN_ROOT_OPTIONS,
        useFactory: asyncOptions.useFactory,
        inject: asyncOptions.inject
    }
}

/**
 * Create an async provider to initialize a new meilisearch client
 * @param inject Injection tokens for DI
 * @returns Provider
 */
export function createMeilisearchClient(): Provider {
    return {
        provide: MeiliClient,
        inject: [PROVIDER_TOKEN_ROOT_OPTIONS],
        useFactory: async (options: MeilisearchRootOptions): Promise<MeiliClient> => {
            if (options.enabled == false) {
                const logger = new Logger(LOGGER_LABEL);
                logger.warn(`Meilisearch client is disabled. Skipping initialization.`);
                return null;
            }

            const client = new MeiliClient(options, []);
            return client.getVersion().catch((error: Error) => {
                const logger = new Logger(LOGGER_LABEL);
                logger.error(`Could not connect to meilisearch instance: ${error.message}`, error.stack);
                logger.error(`Connection to meilisearch failed with following config:`, options)
            }).then(() => {
                return client;
            })
        }
    }
}

export function createIndexProviders(schemas: IndexSchema[]): Provider[] {
    return schemas.map((schema) => ({
        provide: getSchemaToken(schema),
        inject: [PROVIDER_TOKEN_ROOT_OPTIONS, MeiliClient],
        useFactory: async (options: MeilisearchRootOptions, client: MeiliClient | null) => {
            return syncIndexSchema(schema, options, client)
        }
    }))
}

export function getSchemaToken(schema: IndexSchema) {
    return pascalToSnakeCase(schema.name);
}


// export function createPipelineFeatureOptionsProvider(options: PipelineFeatureOptions): Provider {
//     return {
//         provide: PROVIDER_TOKEN_FEATURE_OPTIONS,
//         useValue: options
//     }
// }

// export function createAsyncPipelineFeatureOptionsProvider(asyncOptions: AsyncPipelineFeatureOptions): Provider {
//     return {
//         provide: PROVIDER_TOKEN_FEATURE_OPTIONS,
//         useFactory: asyncOptions.useFactory,
//         inject: asyncOptions.inject
//     }
// }
