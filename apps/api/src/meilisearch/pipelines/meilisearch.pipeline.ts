import { pipeline } from "@soundcore/pipelines";
import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Song } from "../../song/entities/song.entity";
import Database from "../../utils/database/database-worker-client";
import MeilisearchClient from "../../utils/database/meilisearch-worker-client";
import { MEILISEARCH_PIPELINE_ID, MEILISEARCH_PIPELINE_NAME, STAGE_SYNC_ID, STAGE_SYNC_NAME, STEP_SYNC_ALBUMS_ID, STEP_SYNC_ALBUMS_NAME, STEP_SYNC_ARTISTS_ID, STEP_SYNC_ARTISTS_NAME, STEP_SYNC_SONGS_ID, STEP_SYNC_SONGS_NAME } from "../pipeline.constants";
import { step_sync_albums, step_sync_artists, step_sync_songs } from "./stages/meilisearch-find-resources";

export enum MeilisearchResourceType {
    ALBUM = "album",
    ARTIST = "artist",
    SONG = "song"
}

export interface MeilisearchPipelineEnv {
    withTypesOnly?: MeilisearchResourceType[];
}

export default pipeline(MEILISEARCH_PIPELINE_ID, MEILISEARCH_PIPELINE_NAME, "Sync database entries with meilisearch for improved search results")
    /**
     * Checkout stage
     */
    .stage(STAGE_SYNC_ID, STAGE_SYNC_NAME)
    .useResources(async () => {
        return await Promise.all([
            Database.connect(),
            MeilisearchClient.connect([ Artist, Album, Song ])
        ]).then(([ datasource, meilisearch ]) => ({ datasource, meilisearch }));
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
