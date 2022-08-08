import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import path from 'path';
import { QUEUE_INDEXER_NAME } from '../constants';
import { IndexerService } from './services/indexer.service';

@Module({
    providers: [
        IndexerService
    ],
    imports: [
        BullModule.registerQueue({
            name: QUEUE_INDEXER_NAME,
            processors: [
                { path: path.join(__dirname, "worker", "indexer.worker.js"), concurrency: parseInt(process.env.MAX_FILE_WORKERS) || 4 }
            ],
            defaultJobOptions: {
                removeOnComplete: true,
                attempts: 5,  // 5 attempts max on failure
                backoff: 5000 // 5s delay between attempts
            }
        })
    ],
    exports: [
        IndexerService
    ]
})
export class IndexerModule {}
