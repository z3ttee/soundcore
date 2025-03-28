import { Module } from '@nestjs/common';
import { SearchService } from './services/search.service';
import { SearchController } from './controllers/search.controller';
import { SongModule } from '../song/song.module';
import { ArtistModule } from '../artist/artist.module';
import { GenreModule } from '../genre/genre.module';
import { PublisherModule } from '../publisher/publisher.module';
import { LabelModule } from '../label/label.module';
import { DistributorModule } from '../distributor/distributor.module';
import { AlbumModule } from '../album/album.module';
import { UserModule } from '../user/user.module';
import { PlaylistModule } from '../playlist/playlist.module';
import { SearchEngine, SearchEngineConfig, SearchEngineModuleType } from './engines/engine';
import { ConfigService } from '@nestjs/config';
import { MeilisearchEngine } from './engines/meilisearch/meilisearchEngine';
import { DatabaseSearchEngine } from './engines/database/databaseEngine';
import { ScheduleModule } from '@nestjs/schedule';
import { PipelineModule, PipelineService } from '@repo/pipelines';
import path from 'node:path';
import { TasksService } from '../tasks/services/tasks.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    {
      provide: SearchEngine,
      inject: [ConfigService, PipelineService, TasksService],
      useFactory: async (config: ConfigService, pipelines: PipelineService, tasks: TasksService) => {
        if (config.get("SEARCH_ENGINE_MODULE") === "meilisearch") {
          return MeilisearchEngine.createInstance({
            module: "meilisearch",
            host: config.getOrThrow("SEARCH_ENGINE_HOST"),
            port: config.getOrThrow("SEARCH_ENGINE_PORT"),
            key: config.getOrThrow("SEARCH_ENGINE_KEY"),
            services: {
              pipelineService: pipelines,
              tasksService: tasks
            }
          });
        } else {
          return new DatabaseSearchEngine({
            module: "database", services: {
              pipelineService: pipelines,
              tasksService: tasks
            }
          });
        }
      },
    }],
  imports: [
    EventEmitterModule,
    ScheduleModule,
    PipelineModule.registerPipelines({
      concurrent: 10,
      pipelines: [
        path.join(__dirname, "pipelines", "synchronize.pipeline.js")
      ]
    }),
    SongModule,
    ArtistModule,
    GenreModule,
    PublisherModule,
    LabelModule,
    DistributorModule,
    AlbumModule,
    UserModule,
    PlaylistModule
  ]
})
export class SearchModule { }
