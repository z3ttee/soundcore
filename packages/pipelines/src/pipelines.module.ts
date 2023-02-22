import { ConfigurableModuleAsyncOptions, DynamicModule, Module } from "@nestjs/common";
import { LOCAL_OPTIONS_TOKEN } from "./constants";
import { PipelineGlobalOptions, PipelineLocalOptions } from "./options";
import { ConfigurablePipelineModule, MODULE_OPTIONS_TOKEN } from "./pipelines.module-definition";
import { PipelineEventService } from "./services/pipeline-event.service";
import { PipelineQueue } from "./services/pipeline-queue.service";
import { PipelineRegistry } from "./services/pipeline-registry.service";
import { PipelineService } from "./services/pipelines.service";
import { buildDefinitionsFromFiles } from "./utils/registerPipelines";

export const globalRegistry = new PipelineRegistry();

@Module({
    providers: [
        {
            provide: PipelineRegistry,
            useValue: globalRegistry
        }
    ],
    exports: [
        PipelineRegistry
    ]
})
export class PipelineModule extends ConfigurablePipelineModule {

    public static forRoot(options: PipelineGlobalOptions): DynamicModule {
        const module = super.forRoot(options);
        return {
            ...module,
            global: true,
            providers: [
                ...module.providers,
                {
                    provide: PipelineRegistry,
                    useValue: globalRegistry
                }
            ],
            exports: [
                MODULE_OPTIONS_TOKEN,
                PipelineRegistry
            ]
        }
    }

    public static forRootAsync(options: ConfigurableModuleAsyncOptions<PipelineGlobalOptions>): DynamicModule {
        const module = super.forRootAsync(options);
        return {
            ...module,
            global: true,
            providers: [
                ...module.providers,
                {
                    provide: PipelineRegistry,
                    useValue: globalRegistry
                }
            ],
            exports: [
                MODULE_OPTIONS_TOKEN,
                PipelineRegistry
            ]
        }
    }

    public static registerPipelines(options: PipelineLocalOptions): DynamicModule {
        const pipelineFiles = options.pipelines ?? [];
        const definitions = buildDefinitionsFromFiles(pipelineFiles);

        globalRegistry.registerAll(definitions);

        return {
            module: PipelineModule,
            providers: [
                PipelineService,
                PipelineQueue,
                PipelineEventService,
                {
                    provide: LOCAL_OPTIONS_TOKEN,
                    useValue: options
                },
                {
                    provide: PipelineRegistry,
                    useValue: globalRegistry
                },
            ],
            exports: [
                PipelineService
            ]
        }
    }

}