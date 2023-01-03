import path from 'path';
import { Module } from '@nestjs/common';
import { WorkerQueueModule } from '@soundcore/nest-queue';
import { IndexerService } from './services/indexer.service';
import { IndexerQueueService } from './services/indexer-queue.service';

@Module({
    providers: [
        IndexerService,
        IndexerQueueService
    ],
    imports: [
        WorkerQueueModule.forFeature({
            script: path.join(__dirname, "worker", "indexer.worker.js"),
            concurrent: 2
        })
    ],
    exports: [
        IndexerService,
        IndexerQueueService
    ]
})
export class IndexerModule {}
