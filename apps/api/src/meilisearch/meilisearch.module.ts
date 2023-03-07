import path from 'path';

import { DynamicModule, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WorkerQueueModule } from '@soundcore/nest-queue';
import MeiliSearch, { Config } from 'meilisearch';
import { MeiliAlbumService } from './services/meili-album.service';
import { MeiliArtistService } from './services/meili-artist.service';
import { MeiliDistributorService } from './services/meili-distributor.service';
import { MeiliLabelService } from './services/meili-label.service';
import { MeiliPlaylistService } from './services/meili-playlist.service';
import { MeiliPublisherService } from './services/meili-publisher.service';
import { MeiliSongService } from './services/meili-song.service';
import { MeiliUserService } from './services/meili-user.service';
import { MeiliQueueService } from './services/meili-queue.service';
import { PipelineModule, PipelineService } from '@soundcore/pipelines';
import { PIPELINE_ID } from './pipeline.constants';

export interface MeilisearchOptions {
    host: string;
    /**
     * Port of the meilisearch application
     * @default 7700
     */
    port?: number;
    apiKey?: string;
}

@Module({})
export class MeilisearchModule {
    private static logger: Logger = new Logger(MeilisearchModule.name);

    // constructor(private readonly pipeline: PipelineService) {}

    // onModuleInit() {
    //     this.pipeline.createRun(PIPELINE_ID).then(() => {
            
    //     })
    // }

    public static forRoot(options: MeilisearchOptions): DynamicModule {
        // const isDisabled = typeof options?.host === "undefined" || options?.host == null;
        const isDisabled = true;

        const config: Config = {
            host: `${options.host}:${options.port ?? 7700}`,
            headers: {
                "Authorization": `Bearer ${options.apiKey}`
            }
        }
        let meiliclient: MeiliSearch = null;

        try {
            if(isDisabled) {
                this.logger.warn(`No meilisearch host was specified. Disabled module.`);
            } else {
                meiliclient = new MeiliSearch(config);
                meiliclient.getVersion().then((version) => {
                    this.logger.verbose(`Found Meilisearch Instance under '${config.host}'. (v${version.pkgVersion})`);
                }).catch((error: Error) => {
                    this.logger.error(`Failed finding Meilisearch Instance under ${config.host}: ${error.message}`, error.stack);
                });
            }
        } catch (error: any) {
            this.logger.warn(`Could not build MeiliClient. Disabling meilisearch: ${error["message"] || error}`);
        }

        return {
            module: MeilisearchModule,
            global: true,
            imports: [
                ScheduleModule,
                // TasksModule,
                // WorkerQueueModule.forFeature({
                //     script: path.resolve(__dirname, "worker", "meilisearch.worker.js"),
                //     workerType: "thread",
                //     concurrent: 20
                // }),
                // PipelineModule.registerPipelines({
                //     concurrent: 10,
                //     pipelines: [
                //         path.join(__dirname, "pipelines", "meilisearch-sync.pipeline.js")
                //     ]
                // })
            ],
            providers: [
                {
                    provide: MeiliSearch,
                    useValue: meiliclient
                },
                MeiliPlaylistService,
                MeiliUserService,
                MeiliArtistService,
                MeiliAlbumService,
                MeiliSongService,
                MeiliLabelService,
                MeiliPublisherService,
                MeiliDistributorService,
                MeiliQueueService
            ],
            exports: [
                MeiliSearch,
                MeiliPlaylistService,
                MeiliUserService,
                MeiliArtistService,
                MeiliAlbumService,
                MeiliSongService,
                MeiliLabelService,
                MeiliPublisherService,
                MeiliDistributorService,
                MeiliQueueService
            ]
        }
    }

}
