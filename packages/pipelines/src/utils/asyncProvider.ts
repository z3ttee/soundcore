import { Provider } from "@nestjs/common";
import { PipelineGlobalOptions } from "../options";

export function createOptionsProviderAsync(providerToken: string, inject: any[], useFactory: (...args: any[]) => Promise<PipelineGlobalOptions> | PipelineGlobalOptions): Provider<PipelineGlobalOptions> {
    return {
      provide: providerToken,
      inject: inject,
      useFactory: async (...args) => {
        return useFactory(args);
      },
    }
}