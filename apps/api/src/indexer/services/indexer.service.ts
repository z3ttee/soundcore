import { Injectable, Logger } from "@nestjs/common";
import { PipelineRun, PipelineService, RunStatus } from "@soundcore/pipelines";
import { inspect } from "util";
import { PIPELINE_INDEX_ID } from "../pipelines";

@Injectable()
export class IndexerService {
    private logger: Logger = new Logger(IndexerService.name);

    constructor(
        private readonly pipelines: PipelineService
    ) {
        this.pipelines.on("failed", (error, { pipeline }) => {
            console.error(error);
            console.log("Pipeline " + pipeline.id + " failed");
        })
        this.pipelines.on("completed", ({ pipeline }) => {
            console.log("Pipeline " + pipeline.id + " completed");
        })
        this.pipelines.on("status", ({ pipeline }) => {
            console.log("Pipeline status: ", pipeline.status);
        })
        // this.pipelines.on("pipeline:started", (pipeline) => {
        //     console.log("pipeline started");
        //     // TODO: Send update to gateway
        // })
        // this.pipelines.on("pipeline:completed", (pipeline) => {
        //     console.log("pipeline completed");
        //     // TODO: Send update to gateway

        // })
        // this.pipelines.on("pipeline:failed", (error, pipeline) => {
        //     // console.log("pipeline failed: " + error.message);
        //     // TODO: Send update to gateway
        // })
        // this.pipelines.on("pipeline:status", (pipeline) => {
        //     // TODO: Send updated to gateway
        // });
    }

    public async indexMount(mountId: string, force: boolean): Promise<PipelineRun> {
        return this.pipelines.createRun({
            id: PIPELINE_INDEX_ID,
            environment: {
                force: force,
                mountId: mountId
            }
        });
    }

}