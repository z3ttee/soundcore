import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { Environment } from "@repo/bootstrap";
import { MeilisearchModule as MeilisearchModuleNEXT } from "@repo/meilisearch";
import { PipelineModule } from "@repo/pipelines";
import { WorkerQueueModule } from "@repo/queue";
import { AlbumModule } from "./album/album.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ArtistModule } from "./artist/artist.module";
import { AuthenticationModule } from "./authentication/module";
import { CollectionModule } from "./collection/collection.module";
import { ConfigureModule } from "./configure/configure.module";
import { CronModule } from "./cron/cron.module";
import { DistributorModule } from "./distributor/distributor.module";
import { FileModule } from "./file/file.module";
import { FileSystemModule } from "./filesystem/filesystem.module";
import { FileSystemService } from "./filesystem/services/filesystem.service";
import { GeniusModule } from "./genius/genius.module";
import { GenreModule } from "./genre/genre.module";
import { HostnameModule } from "./hostname/hostname.module";
import { ImportModule } from "./import/import.module";
import { IndexerModule } from "./indexer/indexer.module";
import { LabelModule } from "./label/label.module";
import { MeilisearchModule } from "./meilisearch/meilisearch.module";
import { MetricsModule } from "./metrics/metrics.module";
import { MountModule } from "./mount/mount.module";
import { NotificationModule } from "./notification/notification.module";
import { PlaylistModule } from "./playlist/playlist.module";
import { ProfileModule } from "./profile/profile.module";
import { PublisherModule } from "./publisher/publisher.module";
import { SearchModule } from "./search/search.module";
import { SongModule } from "./song/song.module";
import { StreamModule } from "./stream/stream.module";
import { TasksModule } from "./tasks/tasks.module";
import { TracklistModule } from "./tracklist/tracklist.module";
import { UploadModule } from "./upload/upload.module";
import { UserModule } from "./user/user.module";
import { LibrariesModule } from "./v2/libraries/module";
import { ZoneModule } from "./zone/zone.module";

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.dev", ".env"],
      expandVariables: true,
    }),
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        publishableKey: config.getOrThrow("CLERK_PUBLISHABLE_KEY"),
        secretKey: config.getOrThrow("CLERK_SECRET_KEY"),
      }),
    }),
    EventEmitterModule.forRoot({
      global: true,
    }),
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
      retryDelay: 10000,
      charset: "utf8mb4",
    }),
    MeilisearchModuleNEXT.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        enabled: config.get("SEARCH_ENGINE_MODULE") === "meilisearch",
        host: `${config.get("SEARCH_ENGINE_HOST")}:${config.get("SEARCH_ENGINE_PORT")}`,
        apiKey: config.get("SEARCH_ENGINE_KEY"),
        indexPrefix: "sc_",
      }),
    }),
    MeilisearchModule,
    CronModule,
    WorkerQueueModule.forRootAsync({
      useFactory: () => ({
        defaultQueueOptions: {
          concurrent: 1,
          workerType: "thread",
          debounceMs: 500,
        },
      }),
    }),
    PipelineModule.forRootAsync({
      inject: [FileSystemService],
      useFactory: async (fsService: FileSystemService) => {
        return {
          // Enable stdout on dev mode
          enableStdout: Environment.isDev,
          // Disable file logs on dev environment
          disableFileLogs: Environment.isDev,
          logsDirectory: fsService.getLogsDir(),
        };
      },
    }),
    EventEmitterModule.forRoot({ global: true, ignoreErrors: true }),
    LibrariesModule,

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

    ProfileModule,
    MountModule,
    FileModule,
    IndexerModule,
    HostnameModule,
    GeniusModule.forRootAsync({
      useFactory: () => ({
        clientToken: process.env.GENIUS_TOKEN,
      }),
    }),
    TracklistModule,
    MetricsModule,
    ConfigureModule,
    TasksModule.forRoot(),
  ],
  providers: [AppService],
})
export class AppModule {}
