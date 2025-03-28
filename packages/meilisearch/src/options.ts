import { Config } from "meilisearch";

export type MeilisearchRootOptions = Config & {
    /**
     * Prefix string that is applied on all index uids
     */
    indexPrefix?: string;
}

export type AsyncMeilisearchRootOptions = {
    useFactory: (...args: any[]) => Promise<MeilisearchRootOptions> | MeilisearchRootOptions;
    inject?: any[];
}

