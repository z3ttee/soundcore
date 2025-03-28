import { ConfigurableModuleBuilder } from "@nestjs/common";
import { PipelineRootOptions } from "./options";



export const {
    ConfigurableModuleClass: ConfigurablePipelineModule,
    MODULE_OPTIONS_TOKEN
} = new ConfigurableModuleBuilder<PipelineRootOptions>().setClassMethodName("forRoot").build();