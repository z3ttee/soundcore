import { DynamicModule, Module } from "@nestjs/common";
import { AsyncMeilisearchRootOptions, MeilisearchRootOptions } from "./options";
import { IndexSchema } from "./definitions";
import { createAsyncMeilisearchRootOptionsProvider, createIndexProviders, createMeilisearchClient, createMeilisearchRootOptionsProvider, PROVIDER_TOKEN_ROOT_OPTIONS } from "./providers";

@Module({})
export class MeilisearchModule {

    public static forRoot(options: MeilisearchRootOptions): DynamicModule {
        const OptionsProvider = createMeilisearchRootOptionsProvider(options);
        const MeilisearchClientProvider = createMeilisearchClient();

        return {
            module: MeilisearchModule,
            global: true,
            providers: [
                OptionsProvider,
                MeilisearchClientProvider,
            ],
            exports: [
                OptionsProvider,
                MeilisearchClientProvider,
            ]
        }
    }

    public static async forRootAsync(options: AsyncMeilisearchRootOptions): Promise<DynamicModule> {
        const OptionsProvider = createAsyncMeilisearchRootOptionsProvider(options);
        const MeilisearchClientProvider = createMeilisearchClient();

        return {
            module: MeilisearchModule,
            global: true,
            providers: [
                OptionsProvider,
                MeilisearchClientProvider,
            ],
            exports: [
                OptionsProvider,
                MeilisearchClientProvider,
            ]
        }
    }

    public static forFeature(indexes: IndexSchema[]): DynamicModule {
        const providers = createIndexProviders(indexes);

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