import { Page, Pageable } from "@soundcore/common";
import { TasksService } from "../../tasks/services/tasks.service";
import { PipelineService } from "@repo/pipelines";
import { EVENT_TRIGGER_SEARCH_ENGINE_SYNC, PIPELINE_ID_SEARCH_ENGINE_SYNC } from "../../constants";
import { Task } from "../../tasks/entities/task.entity";
import { OnEvent } from "@nestjs/event-emitter";
import { Logger } from "@nestjs/common";
import { Artist } from "../../artist/entities/artist.entity";

export type SearchEngineModuleType = "database" | "meilisearch"
export type SearchEngineObjectType = "artists" | "songs" | "playlists" | "albums"
export type SearchEngineConfig = {
    readonly module: SearchEngineModuleType;
    readonly host?: string;
    readonly port?: number;
    readonly key?: string;

    readonly services: {
        readonly pipelineService: PipelineService;
        readonly tasksService: TasksService;
    }
}
export type SearchEngineDataset<T extends SearchEngineObjectType = never> = T extends "artists" ? Artist[] : never;

export abstract class SearchEngine {
    protected readonly logger = new Logger(SearchEngine.name);

    constructor(
        protected readonly config: SearchEngineConfig,
    ) { }

    /** Method called when searching for users by a given query */
    abstract searchAllUsers<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>>;
    /** Method called when searching for all playlists */
    abstract searchAllPlaylists<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>>;
    /** Method called when searching for all songs */
    abstract searchAllSongs<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>>;
    /** Method called when searching for all albums */
    abstract searchAllAlbums<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>>;
    /** Method called when searching for artists by a given query */
    abstract searchAllArtists<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>>;
    /** Sync database with search engine. Best practice is to call this method on a worker thread instead of the main thread */
    abstract synchronize<T extends SearchEngineObjectType>(type: T, dataset: SearchEngineDataset<T>): Promise<boolean>;

    /** Start syncing database with the search engine */
    @OnEvent(EVENT_TRIGGER_SEARCH_ENGINE_SYNC)
    public async triggerSync(): Promise<Task | null> {
        if (this.config.module === "database") {
            this.logger.log(`Skipped syncing with search engine because the configured engine was set to ${this.config.module}`);
            return;
        }

        return this.config.services.pipelineService.createRun(PIPELINE_ID_SEARCH_ENGINE_SYNC, { config: this.config }).then((pipelineRun) => {
            return this.config.services.tasksService.createTaskFromPipelineRun(pipelineRun).then(async (task) => {
                await this.config.services.pipelineService.enqueueRun(pipelineRun);
                return task;
            })
        })
    }
}