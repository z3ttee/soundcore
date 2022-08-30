import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkerModule } from './worker/worker.module';
import { redisConnectionOptions } from './main';
import { HeartbeatClientModule } from "@soundcore/heartbeat";
import { ConfigModule } from '@soundcore/common';
import { getUrl } from '@soundcore/bootstrap';

@Module({
  imports: [
    ConfigModule,
    HeartbeatClientModule.forRootAsync({
      useFactory: async () => {
        return {
          identifier: "defsoft",
          redis: {
            ...redisConnectionOptions
          },
          staticPayload: {
            test: true,
            
          },
          dynamicPayload: async () => {
            return {
              clientUrl: await getUrl()
            }
          },
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
