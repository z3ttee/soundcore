import { DynamicModule, FactoryProvider, Module, ModuleMetadata } from "@nestjs/common";
import { WorkerService } from "./services/worker.service";
import { createModuleOptionsProviderAsync } from "./utils/asyncProvider";

export interface WorkerModuleOptions {
    /**
     * Activate debug mode.
     * Setting this to true allows the module to
     * print debug messages to the console.
     */
    debug?: boolean;
}

export interface WorkerModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'>, Pick<FactoryProvider, 'inject'> {
    useFactory: (...args: any[]) => Promise<WorkerModuleOptions> | WorkerModuleOptions;
}

@Module({

})
export class WorkerModule {

    public static async forRootAsync(options: WorkerModuleAsyncOptions): Promise<DynamicModule> {
        const optionsProvider = createModuleOptionsProviderAsync(options);

        return {
            module: WorkerModule,
            providers: [
                optionsProvider,
                WorkerService
            ],
            exports: [
                WorkerService
            ]
        }
    }

}