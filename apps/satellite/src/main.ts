import { Logger, VersioningType } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { createBootstrap } from "@soundcore/bootstrap";
import { AppModule } from './app.module';

export const redisConnectionOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_AUTH_PASSWORD || undefined
}

const logger = new Logger("Bootstrap");
createBootstrap(AppModule)
  .useOptions({ cors: true, abortOnError: false })
  .enableCors()
  .enableVersioning({ type: VersioningType.URI, defaultVersion: "1" })
  .useHost(process.env.BIND_ADDRESS)
  .usePort(Number(process.env.PORT))
  .addMicroservice({
    options: {
      transport: Transport.REDIS,
      options: {
        ...redisConnectionOptions
      }
    },
    hybridOptions: {
      inheritAppConfig: true
    }
  })
  .bootstrap().then((app) => {
    app.getUrl().then((url) => {
      logger.log(`Soundcore Satellite Service now listening for requests on url '${url}' and via microservices protocol.`);
    });
  });
