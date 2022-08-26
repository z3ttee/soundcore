import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { WorkerModule } from './worker/worker.module';
import { ZoneModule } from './zone/zone.module';
import { redisConnectionOptions } from './main';
import { HeartbeatClientModule } from "@soundcore/heartbeat";

@Module({
  imports: [
    HealthModule,
    ZoneModule,
    WorkerModule,
    HeartbeatClientModule.forRootAsync({
      useFactory: () => {
        return {
          identifier: "defsoft",
          redis: {
            ...redisConnectionOptions
          },
          staticPayload: {
            test: true
          }
        }
      }
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
