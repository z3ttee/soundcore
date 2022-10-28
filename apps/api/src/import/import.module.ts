import { Module } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { BucketModule } from '../bucket/bucket.module';
import { ArtworkModule } from '../artwork/artwork.module';
import { ImportGateway } from './gateway/import.gateway';
import { SpotifyService } from './spotify/spotify.service';
import { BullModule } from '@nestjs/bull';
import { SpotifyConsumer } from './consumer/spotify.consumer';
import { PlaylistModule } from '../playlist/playlist.module';
import { SongModule } from '../song/song.module';
import { MountModule } from '../mount/mount.module';

@Module({
  controllers: [ImportController],
  providers: [
    ImportService,
    ImportGateway,
    SpotifyService,
    SpotifyConsumer
  ],
  imports: [
    BucketModule,
    MountModule,
    ArtworkModule,
    PlaylistModule,
    SongModule,
    BullModule.registerQueue({
      name: "import-spotify-queue"
    })
  ]
})
export class ImportModule {}
