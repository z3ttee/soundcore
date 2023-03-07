import { FactoryProvider, ModuleMetadata } from "@nestjs/common";

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
    key: string;

    /**
     * Prefix string that is applied on all index uids
     */
    indexPrefix?: string;
}