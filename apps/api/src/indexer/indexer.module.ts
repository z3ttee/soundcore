import path from 'path';
import { Module } from '@nestjs/common';
import { IndexerService } from './services/indexer.service';
import { PipelineModule } from '@soundcore/pipelines';

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
export class IndexerModule {}
