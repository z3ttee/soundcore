import path from 'path';

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PipelineModule } from '@soundcore/pipelines';
import { MeilisearchService } from './services/meili.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        ScheduleModule,
        EventEmitterModule,
        PipelineModule.registerPipelines({
            concurrent: 10,
            pipelines: [
                path.join(__dirname, "pipelines", "meilisearch.pipeline.js")
            ]
        })
    ],
    providers: [
        MeilisearchService
    ],
    exports: [
        MeilisearchService
    ]
})
export class MeilisearchModule {}
