import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtistModule } from './artist/artist.module';
import { BucketModule } from './bucket/bucket.module';
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

@Module({
  imports: [
    EventEmitterModule.forRoot({
      global: true
    }),
    CommonConfigModule,
    FileSystemModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DB_DIALECT as any || "mariadb",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      entityPrefix: process.env.DB_PREFIX,
      retryAttempts: Number.MAX_VALUE,
      retryDelay: 10000
    }),
    MeilisearchModule.forRoot({
      host: `${process.env.MEILISEARCH_HOST}:${process.env.MEILISEARCH_PORT}`,
      headers: {
        "Authorization": `Bearer ${process.env.MEILISEARCH_KEY}`
      }
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
    EventEmitterModule.forRoot({ global: true, ignoreErrors: true }),
    ArtistModule,
    BucketModule,
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
      server_base_url: "https://sso.tsalliance.eu",
      realm: "tsalliance",
      client_id: "alliance-soundcore-api",
      client_secret: "FHl4H5UFr8Tnrf921xUja0a1wHN9jPgR"
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
