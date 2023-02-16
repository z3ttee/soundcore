import path from 'path';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { IndexerService } from './services/indexer.service';
import { PipelineModule, PipelineService } from '@soundcore/pipelines';

@Module({
    providers: [
        IndexerService
    ],
    imports: [
        PipelineModule.registerPipelines({
            pipelines: [
                path.join(__dirname, "pipelines", "indexer.pipeline.js")
            ]
        })
    ],
    exports: [
        IndexerService
    ]
})
export class IndexerModule implements OnModuleInit {
    private readonly logger = new Logger(IndexerModule.name);

    constructor(private readonly pipelineService: PipelineService) {}

    onModuleInit() {
        const mountId = "71514b33-48cf-4864-9368-14ce6b6cf992";

        // this.pipelineService.enqueue(PIPELINE_INDEX_ID, { mountId: mountId }).then((position) => {
        //     this.logger.verbose(`Enqueued pipeline. Position: ${position}`);
        // }).catch((error: Error) => {
        //     this.logger.error(`Failed: ${error.message}`);
        // })
    }

}
