import { Config } from "meilisearch";

export type MeilisearchRootOptions = Config & {
    readonly enabled?: boolean;
    /**
     * Prefix string that is applied on all index uids
     */
    readonly indexPrefix?: string;
}

export type AsyncMeilisearchRootOptions = {
    useFactory: (...args: any[]) => Promise<MeilisearchRootOptions> | MeilisearchRootOptions;
    inject?: any[];
}

