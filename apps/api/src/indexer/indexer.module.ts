import path from 'path';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { WorkerQueueModule } from '@soundcore/nest-queue';
import { IndexerService } from './services/indexer.service';
import { IndexerQueueService } from './services/indexer-queue.service';
import { PipelineModule, PipelineService } from '@soundcore/worker';
import { PIPELINE_INDEX_ID } from './pipelines';

@Module({
    providers: [
        IndexerService,
        IndexerQueueService
    ],
    imports: [
        WorkerQueueModule.forFeature({
            script: path.join(__dirname, "worker", "indexer.worker.js"),
            concurrent: 2
        }),
        PipelineModule.forFeature({
            pipelineScripts: [
                path.join(__dirname, "pipelines", "indexer.pipeline.js")
            ]
        })
    ],
    exports: [
        IndexerService,
        IndexerQueueService
    ]
})
export class IndexerModule implements OnModuleInit {
    private readonly logger = new Logger(IndexerModule.name);

    constructor(private readonly pipelineService: PipelineService) {}

    onModuleInit() {
        const mountId = "71514b33-48cf-4864-9368-14ce6b6cf992";

        this.pipelineService.enqueue(PIPELINE_INDEX_ID, { mountId: mountId }).then((position) => {
            this.logger.verbose(`Enqueued pipeline. Position: ${position}`);
        }).catch((error: Error) => {
            this.logger.error(`Failed: ${error.message}`);
        })
    }

}
