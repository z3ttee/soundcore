import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtistModule } from './artist/artist.module';
import { ZoneModule } from './zone/zone.module';
import { AlbumModule } from './album/album.module';
import { SongModule } from './song/song.module';
import { GeniusModule } from './genius/genius.module';
import { LabelModule } from './label/label.module';
import { PublisherModule } from './publisher/publisher.module';
import { UploadModule } from './upload/upload.module';
import { SearchModule } from './search/search.module';
import { StreamModule } from './stream/stream.module';
import { DistributorModule } from './distributor/distributor.module';
import { GenreModule } from './genre/genre.module';
import { PlaylistModule } from './playlist/playlist.module';
import { UserModule } from './user/user.module';
import { ImportModule } from './import/import.module';
import { CollectionModule } from './collection/collection.module';
import { NotificationModule } from './notification/notification.module';
import { OIDCModule } from './authentication/oidc.module';
import { ProfileModule } from './profile/profile.module';
import { MountModule } from './mount/mount.module';
import { FileModule } from './file/file.module';
import { IndexerModule } from './indexer/indexer.module';
import { MeilisearchModule } from './meilisearch/meilisearch.module';
import { FileSystemModule } from './filesystem/filesystem.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PipesModule } from '@tsalliance/utilities';
import { HostnameModule } from './hostname/hostname.module';
import { CronModule } from './cron/cron.module';
import { CommonConfigModule } from '@soundcore/common';
import { WorkerQueueModule } from '@soundcore/nest-queue';
import { TracklistModule } from './tracklist/tracklist.module';
import { WorkerModule } from '@soundcore/worker';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      global: true
    }),
    CommonConfigModule,
    FileSystemModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "mariadb",
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      entityPrefix: process.env.DB_PREFIX ?? "sc_",
      retryAttempts: Number.MAX_VALUE,
      retryDelay: 10000
    }),
    MeilisearchModule.forRoot({
      host: process.env.MEILISEARCH_HOST,
      port: process.env.MEILISEARCH_PORT ? parseInt(process.env.MEILISEARCH_PORT) : null,
      apiKey: process.env.MEILISEARCH_KEY
    }),
    PipesModule,
    CronModule,
    WorkerQueueModule.forRootAsync({
      useFactory: () => ({
        defaultQueueOptions: {
          concurrent: 1,
          workerType: "thread",
          debounceMs: 500
        }
      })
    }),
    WorkerModule.forRootAsync({
      useFactory: () => ({
        debug: true
      })
    }),
    EventEmitterModule.forRoot({ global: true, ignoreErrors: true }),
    ArtistModule,
    ZoneModule,
    AlbumModule,
    SongModule,
    LabelModule,
    PublisherModule,
    UploadModule,
    SearchModule,
    StreamModule,
    DistributorModule,
    GenreModule,
    PlaylistModule,
    UserModule,
    ImportModule,
    CollectionModule,
    NotificationModule,
    OIDCModule.forRoot({
      issuer: process.env.OIDC_ISSUER,
      client_id: process.env.OIDC_CLIENT_ID,
      client_secret: process.env.OIDC_CLIENT_SECRET
    }),
    ProfileModule,
    MountModule,
    FileModule,
    IndexerModule,
    HostnameModule,
    GeniusModule.forRootAsync({
      useFactory: () => ({
        clientToken: process.env.GENIUS_TOKEN
      }),
    }),
    TracklistModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ]
})
export class AppModule {}
