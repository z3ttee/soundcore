import { Provider } from "@nestjs/common";
import { AsyncPipelineFeatureOptions, AsyncPipelineRootOptions, PipelineFeatureOptions, PipelineRootOptions } from "./options";

export const PROVIDER_TOKEN_ROOT_OPTIONS = "sc:pipeline:module:rootoptions"
export const PROVIDER_TOKEN_FEATURE_OPTIONS = "sc:pipeline:module:featureoptions"

export function createPipelineRootOptionsProvider(options: PipelineRootOptions): Provider {
    return {
        provide: PROVIDER_TOKEN_ROOT_OPTIONS,
        useValue: options
    }
}

export function createAsyncPipelineRootOptionsProvider(asyncOptions: AsyncPipelineRootOptions): Provider {
    return {
        provide: PROVIDER_TOKEN_ROOT_OPTIONS,
        useFactory: asyncOptions.useFactory,
        inject: asyncOptions.inject
    }
}

export function createPipelineFeatureOptionsProvider(options: PipelineFeatureOptions): Provider {
    return {
        provide: PROVIDER_TOKEN_FEATURE_OPTIONS,
        useValue: options
    }
}

export function createAsyncPipelineFeatureOptionsProvider(asyncOptions: AsyncPipelineFeatureOptions): Provider {
    return {
        provide: PROVIDER_TOKEN_FEATURE_OPTIONS,
        useFactory: asyncOptions.useFactory,
        inject: asyncOptions.inject
    }
}
