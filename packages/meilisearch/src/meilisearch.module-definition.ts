import { ConfigurableModuleBuilder } from "@nestjs/common";
import { MeilisearchRootOptions } from "./options";

export const {
    ConfigurableModuleClass: ConfigurableMeilisearchModule,
    MODULE_OPTIONS_TOKEN
} = new ConfigurableModuleBuilder<MeilisearchRootOptions>().setClassMethodName("forRoot").build();