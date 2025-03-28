import { Pageable, Page } from "@soundcore/common";
import { SearchEngine, SearchEngineConfig, SearchEngineDataset, SearchEngineObjectType } from "../engine";
import { IndexSchema } from "@repo/meilisearch/dist/definitions";
import { MeiliClient } from "@repo/meilisearch";
import { Artist } from "../../../artist/entities/artist.entity";
import { TaskStatus } from "meilisearch";

export type MeilisearchEngineConfig = SearchEngineConfig & {
    readonly schemas?: IndexSchema[];
}

export class MeilisearchEngine extends SearchEngine {
    private _client = new MeiliClient({
        host: `${this.config.host}:${this.config.port}`,
        apiKey: this.config.key
    }, this.config.schemas ?? []);

    constructor(protected readonly config: MeilisearchEngineConfig) {
        super(config);
    }

    /** Create a new instance of the meilisearch engine */
    public static async createInstance(config: MeilisearchEngineConfig): Promise<MeilisearchEngine> {
        return new MeilisearchEngine(config);
    }

    searchAllUsers<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>> {
        throw new Error("Method not implemented.");
    }
    searchAllPlaylists<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>> {
        throw new Error("Method not implemented.");
    }
    searchAllSongs<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>> {
        throw new Error("Method not implemented.");
    }
    searchAllAlbums<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>> {
        throw new Error("Method not implemented.");
    }
    searchAllArtists<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>> {
        return this._client.getIndexFromSchema(Artist).search(query, {
            limit: pagination.limit,
            offset: pagination.offset
        }).then((res) => Page.of(res.hits, res.totalHits, pagination))
    }

    public async synchronize(type: SearchEngineObjectType, dataset: SearchEngineDataset) {
        // Sync artists
        if (type === "artists") {
            // Get index info and update documents
            return this._client.getIndexFromSchema(Artist).updateDocuments(dataset).then((enqueuedTask) => {
                // Wait for task to finish
                return this._client.waitForTask(enqueuedTask.taskUid).then((task) => task.status === TaskStatus.TASK_SUCCEEDED);
            })
        }

    }
}