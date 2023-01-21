import { Provider } from "@nestjs/common";
import { MODULE_OPTIONS_TOKEN } from "../../constants";
import { WorkerModuleAsyncOptions, WorkerModuleOptions } from "../worker.module";

export function createModuleOptionsProviderAsync(asyncOptions: WorkerModuleAsyncOptions): Provider<WorkerModuleOptions> {
    return {
      provide: MODULE_OPTIONS_TOKEN,
      useFactory: async (...args) => {
            return await asyncOptions.useFactory(args);
      },
      inject: asyncOptions.inject
    }
}