import { Injectable, Logger } from "@nestjs/common";
import { PipelineService } from "@soundcore/worker";

@Injectable()
export class IndexerService {
    private logger: Logger = new Logger(IndexerService.name);

    constructor(
        private readonly pipelines: PipelineService
    ) {
        this.pipelines.on("pipeline:started", (pipeline) => {
            console.log("pipeline started");
            // TODO: Send update to gateway
        })
        this.pipelines.on("pipeline:completed", (pipeline) => {
            console.log("pipeline completed");
            // TODO: Send update to gateway

        })
        this.pipelines.on("pipeline:failed", (error, pipeline) => {
            console.log("pipeline failed");
            console.error(error);
            // TODO: Send update to gateway
        })
        this.pipelines.on("pipeline:status", (pipeline) => {
            // TODO: Send updated to gateway
        });
    }

}