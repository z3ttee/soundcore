import path from 'path';

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PipelineModule } from '@soundcore/pipelines';
import { MeilisearchService } from './services/meili.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MeiliBackgroundService } from './services/meili-background.service';

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
        MeilisearchService,
        MeiliBackgroundService
    ],
    exports: [
        MeilisearchService
    ]
})
export class MeilisearchModule {}
