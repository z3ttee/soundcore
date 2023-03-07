import { pipeline } from "@soundcore/pipelines";
import { AlbumIndex } from "../../album/entities/album.entity";
import { ArtistIndex } from "../../artist/entities/artist.entity";
import Database from "../../utils/database/database-worker-client";
import MeilisearchClient from "../../utils/database/meilisearch-worker-client";
import { PIPELINE_ID, PIPELINE_NAME, STAGE_CHECKOUT_ID, STAGE_CHECKOUT_NAME, STEP_FIND_RESOURCES_ID, STEP_FIND_RESOURCES_NAME } from "../pipeline.constants";
import { stage_checkout_resources } from "./stages/meilisearch-find-resources";

export enum MeilisearchResourceType {
    ALBUM = "album",
    ARTIST = "artist",
    SONG = "song"
}

export interface MeilisearchPipelineEnv {

}

export default pipeline(PIPELINE_ID, PIPELINE_NAME, "Sync database entries with meilisearch for improved search results")
    /**
     * Checkout stage
     */
    .stage(STAGE_CHECKOUT_ID, STAGE_CHECKOUT_NAME, "Find resources in the database where next sync is due")
    .useResources(() => {
        return Promise.allSettled([
            Database.connect(),
            MeilisearchClient.connect([ ArtistIndex, AlbumIndex ])
        ]).then(([ datasource, meilisearch ]) => ({ datasource, meilisearch }));
    })
    .step(STEP_FIND_RESOURCES_ID, STEP_FIND_RESOURCES_NAME, "Checking out resources").run((params) => {
        return stage_checkout_resources(params);
    })
