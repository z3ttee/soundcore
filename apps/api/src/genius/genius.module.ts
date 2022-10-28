import path from 'path';
import { DynamicModule, Module } from '@nestjs/common';
import { WorkerQueueModule } from '@soundcore/nest-queue';
import { ArtworkModule } from '../artwork/artwork.module';
import { DistributorModule } from '../distributor/distributor.module';
import { GenreModule } from '../genre/genre.module';
import { LabelModule } from '../label/label.module';
import { PublisherModule } from '../publisher/publisher.module';
import { GeniusClientService } from './services/genius-client.service';
import { GeniusQueueService } from './services/genius-queue.service';
import { GeniusService } from './services/genius.service';
import { AsyncDynamicModuleOptions, createOptionsProviderFromAsync } from '../utils/modules/asyncDynamicModule';

export interface GeniusModuleOptions {
  clientToken: string;
}

@Module({})
export class GeniusModule {

  public static async forRootAsync(options: AsyncDynamicModuleOptions<GeniusModuleOptions>): Promise<DynamicModule> {
    const optionsProvider = createOptionsProviderFromAsync<GeniusModuleOptions>("genius-module-options", options);

    return {
      module: GeniusModule,
      global: true,
      imports: [
        ...(options.imports || []),
        ArtworkModule,
        PublisherModule,
        LabelModule,
        DistributorModule,
        GenreModule,
        ArtworkModule,
        WorkerQueueModule.forFeature({
          script: path.join(__dirname, "worker", "genius.worker.js"),
          concurrent: 4
        })
      ],
      providers: [
        optionsProvider,
        GeniusService, 
        GeniusClientService,
        GeniusQueueService
      ]
    }
  }

}
