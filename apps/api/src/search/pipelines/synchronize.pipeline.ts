import { pipeline } from "@soundcore/pipelines";
import Database from "../../utils/database/database-worker-client";
import { MeilisearchWorkerClient } from "../../utils/database/meilisearch-worker-client";
import { PIPELINE_ID_SEARCH_ENGINE_SYNC } from "../../constants";
import { step_sync_albums, step_sync_artists, step_sync_songs } from "../../meilisearch/pipelines/stages/meilisearch-find-resources";
import { STAGE_SYNC_ID, STAGE_SYNC_NAME, STEP_SYNC_ARTISTS_ID, STEP_SYNC_ARTISTS_NAME, STEP_SYNC_ALBUMS_ID, STEP_SYNC_ALBUMS_NAME, STEP_SYNC_SONGS_ID, STEP_SYNC_SONGS_NAME, SEARCH_ENGINE_PIPELINE_NAME } from "../../meilisearch/pipeline.constants";

export enum MeilisearchResourceType {
    ALBUM = "album",
    ARTIST = "artist",
    SONG = "song"
}

export interface MeilisearchPipelineEnv {
    withTypesOnly?: MeilisearchResourceType[];
}

export default pipeline(PIPELINE_ID_SEARCH_ENGINE_SYNC, SEARCH_ENGINE_PIPELINE_NAME, "Sync database entries with the configured search engine")
    /**
     * Checkout stage
     */
    .stage(STAGE_SYNC_ID, STAGE_SYNC_NAME)
    .useResources(async (env) => {
        return await Promise.all([
            Database.connect(),
            MeilisearchWorkerClient.create(env.config)
        ]).then(([datasource, meilisearch]) => ({ datasource, meilisearch }));
    })
    // Sync artists if flag is set or no flags exist
    .step(STEP_SYNC_ARTISTS_ID, STEP_SYNC_ARTISTS_NAME).condition((params) => {
        const types = (params.environment as MeilisearchPipelineEnv).withTypesOnly ?? [];
        return types.length <= 0 || types.includes(MeilisearchResourceType.ARTIST);
    }).run((params) => {
        return step_sync_artists(params);
    })
    // Sync albums if flag is set or no flags exist
    .step(STEP_SYNC_ALBUMS_ID, STEP_SYNC_ALBUMS_NAME).condition((params) => {
        const types = (params.environment as MeilisearchPipelineEnv).withTypesOnly ?? [];
        return types.length <= 0 || types.includes(MeilisearchResourceType.ALBUM);
    }).run((params) => {
        return step_sync_albums(params);
    })
    // Sync songs if flag is set or no flags exist
    .step(STEP_SYNC_SONGS_ID, STEP_SYNC_SONGS_NAME).condition((params) => {
        const types = (params.environment as MeilisearchPipelineEnv).withTypesOnly ?? [];
        return types.length <= 0 || types.includes(MeilisearchResourceType.SONG);
    }).run((params) => {
        return step_sync_songs(params);
    })
