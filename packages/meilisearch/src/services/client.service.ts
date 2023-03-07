import { Inject, Injectable } from "@nestjs/common";
import MeiliSearch from "meilisearch";
import { INDEXES_TOKEN } from "../constants";
import { IndexSchema } from "../definitions";
import { MODULE_OPTIONS_TOKEN } from "../meilisearch.module-definition";
import { MeilisearchRootOptions } from "../options";

@Injectable()
export class MeilisearchClient {

    private readonly _client: MeiliSearch;

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN) private readonly options: MeilisearchRootOptions,
        @Inject(INDEXES_TOKEN) private readonly indexes: IndexSchema[]
    ) {
        this._client = new MeiliSearch({
            host: `${options.host}:${options.port ?? 7700}`,
            headers: {
                "Authorization": `Bearer ${options.key}`
            }
        });
    }

    // private async synchronizeIndexes()

}