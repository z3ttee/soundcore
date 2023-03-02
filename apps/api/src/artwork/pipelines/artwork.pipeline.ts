import { pipeline } from "@soundcore/pipelines";
import Database from "../../utils/database/database-worker-client";
import { ArtworkFlag } from "../entities/artwork.entity";
import { ARTWORK_PIPELINE_ID, ARTWORK_PIPELINE_NAME, ARTWORK_STAGE_CHECKOUT_ARTWORKS_ID, ARTWORK_STAGE_CHECKOUT_ARTWORKS_NAME, ARTWORK_STEP_FETCH_ARTWORKS_ID, ARTWORK_STEP_FETCH_ARTWORKS_NAME } from "./constants";

export interface ArtworkPipelineEnv {
    withFlagsOnly?: ArtworkFlag[];
}

export default pipeline(ARTWORK_PIPELINE_ID, ARTWORK_PIPELINE_NAME, "Extract or download artworks created in the database")
    .stage(ARTWORK_STAGE_CHECKOUT_ARTWORKS_ID, ARTWORK_STAGE_CHECKOUT_ARTWORKS_NAME, "Checkout artworks by looking up entities in the database")
    .useResources(() => Database.connect().then((datasource) => ({ datasource })))
    .step(ARTWORK_STEP_FETCH_ARTWORKS_ID, ARTWORK_STEP_FETCH_ARTWORKS_NAME, "Fetch artworks that need to be processed").run((params) => {
        console.log(params);
    })