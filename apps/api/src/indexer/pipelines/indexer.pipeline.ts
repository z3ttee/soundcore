import { PipelineBuilder } from "@soundcore/worker";
import { DataSource } from "typeorm";
import Database from "../../utils/database/database-worker-client";
import { PIPELINE_INDEX_ID, PIPELINE_INDEX_NAME, STAGE_SCAN_ID, STAGE_SCAN_NAME, STEP_CHECKOUT_MOUNT_ID, STEP_CHECKOUT_MOUNT_NAME, STEP_INDEX_FILES_ID, STEP_INDEX_FILES_NAME, STEP_LOOKUP_FILES_ID, STEP_LOOKUP_FILES_NAME } from "../pipelines";
import { step_checkout_mount, step_create_database_entries, step_search_files } from "./stages/scan.stage";

export default function() {
    return PipelineBuilder.createPipeline(PIPELINE_INDEX_ID, PIPELINE_INDEX_NAME)
        .concurrent(2)
        .stage(STAGE_SCAN_ID, STAGE_SCAN_NAME).useResources(() => {
            // Initialize scan stage
            return Database.connect().then((datasource) => ({ datasource: datasource }));
        }).step(STEP_CHECKOUT_MOUNT_ID, STEP_CHECKOUT_MOUNT_NAME).run(async ({ step, stage, environment, logger }) => {
            const datasource: DataSource = stage.resource("datasource");
            await step_checkout_mount(step, environment, datasource, logger);
        }).step(STEP_LOOKUP_FILES_ID, STEP_LOOKUP_FILES_NAME).run(async ({ step, stage, logger }) => {
            await step_search_files(stage, step, logger);
        }).step(STEP_INDEX_FILES_ID, STEP_INDEX_FILES_NAME).run(async ({ step, stage, logger }) => {
            const datasource: DataSource = stage.resource("datasource");
            await step_create_database_entries(stage, step, datasource, logger);
        }).done();
}
