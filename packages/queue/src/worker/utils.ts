import { Provider } from "@nestjs/common";
import { WORKERQUEUE_OPTIONS } from "../constants";
import { WorkerQueueAsyncOptions, WorkerQueueModuleOptions } from "./worker.module";

export function createRedisOptionsProviderAsync(asyncOptions: WorkerQueueAsyncOptions): Provider<WorkerQueueModuleOptions> {
    return {
      provide: WORKERQUEUE_OPTIONS,
      useFactory: async (...args) => {
            return await asyncOptions.useFactory(args);
      },
      inject: asyncOptions.inject
    }
}