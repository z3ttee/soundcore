import path from 'path';

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PipelineModule } from '@soundcore/pipelines';
import { MeilisearchGeneralService } from './services/meili.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

export interface MeilisearchOptions {
    host: string;
    /**
     * Port of the meilisearch application
     * @default 7700
     */
    port?: number;
    apiKey?: string;
}

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
        MeilisearchGeneralService
    ]
})
export class MeilisearchModule {}
