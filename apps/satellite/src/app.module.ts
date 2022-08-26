import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkerModule } from './worker/worker.module';
import { redisConnectionOptions } from './main';
import { HeartbeatClientModule } from "@soundcore/heartbeat";
import { ConfigModule } from '@soundcore/config';

@Module({
  imports: [
    ConfigModule,
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
    }),
    WorkerModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ]
})
export class AppModule {}
