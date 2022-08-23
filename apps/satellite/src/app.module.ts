import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { WorkerModule } from './worker/worker.module';
import { ZoneModule } from './zone/zone.module';
import { SoundcoreRedisModule } from "@soundcore/redis";
import { redisConnectionOptions } from './main';

@Module({
  imports: [
    HealthModule,
    ZoneModule,
    WorkerModule,
    SoundcoreRedisModule.forRoot({
      ...redisConnectionOptions
    })
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ]
})
export class AppModule {}
