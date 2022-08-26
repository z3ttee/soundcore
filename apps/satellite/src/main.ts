import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

export const redisConnectionOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_AUTH_PASSWORD || undefined
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true, abortOnError: false });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      ...redisConnectionOptions
    }
  }, {
    inheritAppConfig: true
  })

  const config = app.get(ConfigService);
  const port = config.get<number>("PORT") || 3003
  const logger = new Logger("Bootstrap");
  
  // Start connected microservices 
  await app.startAllMicroservices().then(async (app) => {
    // Listen to port on http
    await app.listen(port).then(() => {
      logger.log(`Soundcore Satellite Service now listening for requests on port ${port} and via microservices protocol.`);
    });
  });
  
}

bootstrap();
