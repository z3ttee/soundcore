import { FactoryProvider, ModuleMetadata } from "@nestjs/common";
import { Config } from "meilisearch";

export type AsyncPipelineGlobalOptions = {
    useFactory: (...args: any[]) => Promise<MeilisearchRootOptions> | MeilisearchRootOptions;
} & Pick<ModuleMetadata, 'imports'> & Pick<FactoryProvider, 'inject'>

export interface MeilisearchRootOptions {
    /**
     * Hostname of the meilisearch instance
     */
    host: string;

    /**
     * Port of the meilisearch instance
     */
    port: number;

    /**
     * API Key to access the meilisearch instance.
     */
    key: Config["apiKey"];

    /**
     * Prefix string that is applied on all index uids
     */
    indexPrefix?: string;

    requestConfig?: Config["requestConfig"]
}