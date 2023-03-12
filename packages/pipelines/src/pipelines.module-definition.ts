import { ConfigurableModuleBuilder } from "@nestjs/common";
import { PipelineGlobalOptions } from "./options";



export const {
    ConfigurableModuleClass: ConfigurablePipelineModule,
    MODULE_OPTIONS_TOKEN
} = new ConfigurableModuleBuilder<PipelineGlobalOptions>().setClassMethodName("forRoot").build();