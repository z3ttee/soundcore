import { DynamicModule, Module } from "@nestjs/common";
import { LOCAL_OPTIONS_TOKEN } from "./constants";
import { PipelineRootOptions, PipelineFeatureOptions, AsyncPipelineRootOptions, AsyncPipelineFeatureOptions } from "./options";
import { ConfigurablePipelineModule } from "./pipelines.module-definition";
import { PipelineEventService } from "./services/pipeline-event.service";
import { PipelineQueue } from "./services/pipeline-queue.service";
import { PipelineRegistry } from "./services/pipeline-registry.service";
import { PipelineService } from "./services/pipelines.service";
import { buildDefinitionsFromFiles } from "./utils/registerPipelines";
import { createAsyncPipelineFeatureOptionsProvider, createAsyncPipelineRootOptionsProvider, createPipelineFeatureOptionsProvider, createPipelineRootOptionsProvider } from "./providers";

export const rootRegistry = new PipelineRegistry();

@Module({})
export class PipelineModule {

    public static forRoot(options: PipelineRootOptions): DynamicModule {
        const OptionsProvider = createPipelineRootOptionsProvider(options);

        return {
            module: PipelineModule,
            global: true,
            providers: [
                OptionsProvider,
                {
                    provide: PipelineRegistry,
                    useValue: rootRegistry
                }
            ],
            exports: [
                PipelineRegistry
            ]
        }
    }

    public static async forRootAsync(asyncOptions: AsyncPipelineRootOptions): Promise<DynamicModule> {
        const OptionsProvider = createAsyncPipelineRootOptionsProvider(asyncOptions);

        return {
            module: PipelineModule,
            global: true,
            providers: [
                OptionsProvider,
                {
                    provide: PipelineRegistry,
                    useValue: rootRegistry
                }
            ],
            exports: [
                PipelineRegistry
            ]
        }
    }

    public static forFeature(featureOptions: PipelineFeatureOptions): DynamicModule {
        const OptionsProvider = createPipelineFeatureOptionsProvider(featureOptions);

        return {
            module: PipelineModule,
            providers: [
                PipelineService,
                PipelineQueue,
                PipelineEventService,
                OptionsProvider
            ],
            exports: [
                PipelineService
            ]
        }
    }

    public static async forFeatureAsync(asyncFeatureOptions: AsyncPipelineFeatureOptions): Promise<DynamicModule> {
        const OptionsProvider = createAsyncPipelineFeatureOptionsProvider(asyncFeatureOptions);

        return {
            module: PipelineModule,
            providers: [
                PipelineService,
                PipelineQueue,
                PipelineEventService,
                OptionsProvider
            ],
            exports: [
                PipelineService
            ]
        }
    }

}