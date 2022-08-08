import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { BullModule } from '@nestjs/bull';
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

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        ".env.dev",
        ".env"
      ]
    }),
    FileSystemModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "mysql",
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
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_AUTH_PASS,
        maxRetriesPerRequest: null,
        enableReadyCheck: false
      },
      defaultJobOptions: {
        removeOnFail: true,
        removeOnComplete: true,
      },
      limiter: {
        // Maximum 200 tasks per second
        max: 200,
        duration: 1000
      }
    }),
    EventEmitterModule.forRoot({ global: true, ignoreErrors: true }),
    ArtistModule,
    BucketModule,
    AlbumModule,
    SongModule,
    GeniusModule,
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
    HostnameModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ]
})
export class AppModule {}
