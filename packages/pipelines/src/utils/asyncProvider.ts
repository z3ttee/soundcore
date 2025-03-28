import { Provider } from "@nestjs/common";
import { PipelineRootOptions } from "../options";

export function createOptionsProviderAsync(providerToken: string, inject: any[], useFactory: (...args: any[]) => Promise<PipelineRootOptions> | PipelineRootOptions): Provider<PipelineRootOptions> {
  return {
    provide: providerToken,
    inject: inject,
    useFactory: async (...args) => {
      return useFactory(args);
    },
  }
}