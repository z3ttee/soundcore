import { DynamicModule, Logger, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import MeiliSearch, { Config } from 'meilisearch';
import { MeiliAlbumService } from './services/meili-album.service';
import { MeiliArtistService } from './services/meili-artist.service';
import { MeiliDistributorService } from './services/meili-distributor.service';
import { MeiliLabelService } from './services/meili-label.service';
import { MeiliPlaylistService } from './services/meili-playlist.service';
import { MeiliPublisherService } from './services/meili-publisher.service';
import { MeiliSongService } from './services/meili-song.service';
import { MeiliUserService } from './services/meili-user.service';

@Module({
    
})
export class MeilisearchModule {
    private static logger: Logger = new Logger(MeilisearchModule.name);

    public static forRoot(config: Config): DynamicModule {
        const meiliclient = new MeiliSearch(config);
        meiliclient.getVersion().then((version) => {
            this.logger.verbose(`Found Meilisearch Instance under '${config.host}'. (v${version.pkgVersion})`);
        }).catch((error: Error) => {
            this.logger.error(`Failed finding Meilisearch Instance under ${config.host}: ${error.message}`, error.stack);
        })

        return {
            module: MeilisearchModule,
            global: true,
            imports: [
                ScheduleModule
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
                MeiliDistributorService
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
                MeiliDistributorService
            ]
        }
    }

}
