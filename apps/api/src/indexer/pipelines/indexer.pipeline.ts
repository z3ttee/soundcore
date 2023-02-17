import { pipeline } from "@soundcore/pipelines";
import Database from "../../utils/database/database-worker-client";
import { PIPELINE_INDEX_ID, PIPELINE_INDEX_NAME, STAGE_CLEANUP_ID, STAGE_CLEANUP_NAME, STAGE_METADATA_ID, STAGE_METADATA_NAME, STAGE_SCAN_ID, STAGE_SCAN_NAME, STEP_CHECKOUT_MOUNT_ID, STEP_CHECKOUT_MOUNT_NAME, STEP_CHECK_FILES_ID, STEP_CHECK_FILES_NAME, STEP_CLEANUP_DUPLICATES_ID, STEP_CLEANUP_DUPLICATES_NAME, STEP_CLEANUP_FAILED_ID, STEP_CLEANUP_FAILED_NAME, STEP_CLEANUP_SUCCEEDED_ID, STEP_CLEANUP_SUCCEEDED_NAME, STEP_CREATE_ALBUMS_ID, STEP_CREATE_ALBUMS_NAME, STEP_CREATE_ARTISTS_ID, STEP_CREATE_ARTISTS_NAME, STEP_CREATE_SONGS_ID, STEP_CREATE_SONGS_NAME, STEP_INDEX_FILES_ID, STEP_INDEX_FILES_NAME, STEP_LOOKUP_FILES_ID, STEP_LOOKUP_FILES_NAME, STEP_READ_TAGS_ID, STEP_READ_TAGS_NAME } from "../pipelines";
import { step_check_files, step_update_duplicate_files, step_update_failed_files, step_update_succeeded_files } from "./stages/cleanup.stage";
import { step_create_albums, step_create_artists, step_create_songs, step_read_mp3_tags } from "./stages/metadata.stage";
import { step_checkout_mount, step_create_database_entries, step_search_files } from "./stages/scan.stage";

export default pipeline(PIPELINE_INDEX_ID, PIPELINE_INDEX_NAME)
    /**
     * Stage: Scanning
     */
    .stage(STAGE_SCAN_ID, STAGE_SCAN_NAME).useResources(() => {
        return Database.connect().then((datasource) => ({ datasource: datasource }));
    }).step(STEP_CHECKOUT_MOUNT_ID, STEP_CHECKOUT_MOUNT_NAME).run((params) => {
        return step_checkout_mount(params);
    }).step(STEP_LOOKUP_FILES_ID, STEP_LOOKUP_FILES_NAME).condition((_, shared) => !!shared["mount"]).run((params) => {
        return step_search_files(params);
    }).step(STEP_INDEX_FILES_ID, STEP_INDEX_FILES_NAME).condition((outputs) => outputs["files"]?.length > 0).run((params) => {
        return step_create_database_entries(params);
    }).next()
    /**
     * Stage: Metadata
     */
    .stage(STAGE_METADATA_ID, STAGE_METADATA_NAME).condition((prevStageOutputs) => prevStageOutputs[`${STEP_INDEX_FILES_ID}.files`]?.length > 0).useResources(() => {
        return Database.connect().then((datasource) => ({ datasource: datasource }));
    }).step(STEP_READ_TAGS_ID, STEP_READ_TAGS_NAME).run((params) => {
        return step_read_mp3_tags(params);
    }).step(STEP_CREATE_ARTISTS_ID, STEP_CREATE_ARTISTS_NAME).run((params) => {
        return step_create_artists(params);
    }).step(STEP_CREATE_ALBUMS_ID, STEP_CREATE_ALBUMS_NAME).run((params) => {
        return step_create_albums(params);
    }).step(STEP_CREATE_SONGS_ID, STEP_CREATE_SONGS_NAME).run((params) => {
        return step_create_songs(params);
    }).next()
    /**
     * Stage: Cleanup
     */
    .stage(STAGE_CLEANUP_ID, STAGE_CLEANUP_NAME).useResources(() => {
        return Database.connect().then((datasource) => ({ datasource: datasource }));
    }).step(STEP_CHECK_FILES_ID, STEP_CHECK_FILES_NAME).run((params) => {
        return step_check_files(params);
    }).step(STEP_CLEANUP_FAILED_ID, STEP_CLEANUP_FAILED_NAME).run((params) => {
        return step_update_failed_files(params)
    }).step(STEP_CLEANUP_DUPLICATES_ID, STEP_CLEANUP_DUPLICATES_NAME).run((params) => {
        return step_update_duplicate_files(params)
    }).step(STEP_CLEANUP_SUCCEEDED_ID, STEP_CLEANUP_SUCCEEDED_NAME).run((params) => {
        return step_update_succeeded_files(params)
    })
    /**
     * Stage: Meilisearch
     */