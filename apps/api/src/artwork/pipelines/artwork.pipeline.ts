import { pipeline } from "@soundcore/pipelines";
import Database from "../../utils/database/database-worker-client";
import { Artwork, ArtworkFlag, ArtworkType } from "../entities/artwork.entity";
import { ARTWORK_PIPELINE_ID, ARTWORK_PIPELINE_NAME, ARTWORK_STAGE_CHECKOUT_ARTWORKS_ID, ARTWORK_STAGE_CHECKOUT_ARTWORKS_NAME, ARTWORK_STAGE_CLEANUP_ARTWORKS_ID, ARTWORK_STAGE_CLEANUP_ARTWORKS_NAME, ARTWORK_STAGE_PROCESS_ARTWORKS_ID, ARTWORK_STAGE_PROCESS_ARTWORKS_NAME, ARTWORK_STEP_FETCH_ARTWORKS_BY_FLAGS_ID, ARTWORK_STEP_FETCH_ARTWORKS_BY_FLAGS_NAME, ARTWORK_STEP_FETCH_ARTWORKS_BY_TYPE_ID, ARTWORK_STEP_FETCH_ARTWORKS_BY_TYPE_NAME, ARTWORK_STEP_FETCH_ARTWORKS_ID, ARTWORK_STEP_FETCH_ARTWORKS_NAME, ARTWORK_STEP_FETCH_SELECTED_ARTWORKS_ID, ARTWORK_STEP_FETCH_SELECTED_ARTWORKS_NAME, ARTWORK_STEP_WRITE_ARTWORKS_ID, ARTWORK_STEP_WRITE_ARTWORKS_NAME } from "./constants";
import { step_checkout_artworks, step_checkout_types_only_artworks } from "./stages/checkout.stage";
import { step_update_artworks } from "./stages/cleanup.stage";
import { step_write_artworks } from "./stages/write.stage";

export interface ArtworkPipelineEnv {
    withFlagsOnly?: ArtworkFlag[];
    withTypesOnly?: ArtworkType[];
    selectedIds?: Pick<Artwork, "id">[];
}

export default pipeline(ARTWORK_PIPELINE_ID, ARTWORK_PIPELINE_NAME, "Extract or download artworks created in the database")
    /**
     * Artwork Checkout
     */
    .stage(ARTWORK_STAGE_CHECKOUT_ARTWORKS_ID, ARTWORK_STAGE_CHECKOUT_ARTWORKS_NAME, "Checkout artworks by looking up entities in the database")
    .useResources(() => Database.connect().then((datasource) => ({ datasource })))
    .step(ARTWORK_STEP_FETCH_ARTWORKS_ID, ARTWORK_STEP_FETCH_ARTWORKS_NAME, "Fetch artworks that need to be processed").condition((params) => {
        // Skip step, if withFlagsOnly or selectedIds is not empty
        const env = params.environment as ArtworkPipelineEnv;
        return (env.withFlagsOnly ?? []).length <= 0 && (env.selectedIds ?? []).length <= 0 && (env.withTypesOnly ?? []).length <= 0;
    }).run((params) => {
        return step_checkout_artworks(params);
    }).step(ARTWORK_STEP_FETCH_ARTWORKS_BY_FLAGS_ID, ARTWORK_STEP_FETCH_ARTWORKS_BY_FLAGS_NAME, "Fetch artworks by specified flags").condition((params) => {
        // Skip step, if withFlagsOnly or selectedIds is not empty
        const env = params.environment as ArtworkPipelineEnv;
        return (env.withFlagsOnly ?? []).length > 0 && (env.selectedIds ?? []).length <= 0 && (env.withTypesOnly ?? []).length <= 0;
    }).run((params) => {
        return step_checkout_artworks(params);
    }).step(ARTWORK_STEP_FETCH_SELECTED_ARTWORKS_ID, ARTWORK_STEP_FETCH_SELECTED_ARTWORKS_NAME, "Fetch artworks by selected ids").condition((params) => {
        // Do not skip this stage, if withFlagsOnly is not empty and ids are selected
        const env = params.environment as ArtworkPipelineEnv;
        return (env.withFlagsOnly ?? []).length <= 0 && (env.selectedIds ?? []).length > 0 && (env.withTypesOnly ?? []).length <= 0;
    }).run((params) => {
        return step_checkout_artworks(params);
    }).step(ARTWORK_STEP_FETCH_ARTWORKS_BY_TYPE_ID, ARTWORK_STEP_FETCH_ARTWORKS_BY_TYPE_NAME, "Fetch artworks by types").condition((params) => {
        // Do not skip this stage, if withFlagsOnly is not empty and ids are selected
        const env = params.environment as ArtworkPipelineEnv;
        return (env.withFlagsOnly ?? []).length <= 0 && (env.selectedIds ?? []).length <= 0 && (env.withTypesOnly ?? []).length > 0;
    }).run((params) => {
        return step_checkout_types_only_artworks(params);
    })
    .next()
    /**
     * Write artwork
     */
    .stage(ARTWORK_STAGE_PROCESS_ARTWORKS_ID, ARTWORK_STAGE_PROCESS_ARTWORKS_NAME, "Download or extract artworks and write to file")
    .useResources(() => Database.connect().then((datasource) => ({ datasource })))
    .step(ARTWORK_STEP_WRITE_ARTWORKS_ID, ARTWORK_STEP_WRITE_ARTWORKS_NAME, "Write artwork file and get accent color").run((params) => {
        return step_write_artworks(params);
    }).next()
    /**
     * Write artwork
     */
    .stage(ARTWORK_STAGE_CLEANUP_ARTWORKS_ID, ARTWORK_STAGE_CLEANUP_ARTWORKS_NAME, "Update artwork statuses")
    .useResources(() => Database.connect().then((datasource) => ({ datasource })))
    .step(ARTWORK_STEP_WRITE_ARTWORKS_ID, ARTWORK_STEP_WRITE_ARTWORKS_NAME, "Update artwork statuses").run((params) => {
        return step_update_artworks(params);
    }).next()