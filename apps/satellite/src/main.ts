import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

export const redisConnectionOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_AUTH_PASSWORD || undefined
}

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.REDIS,
      options: {
        ...redisConnectionOptions
      }
    },
  );

  await app.listen().then(() => {
    logger.log(`Microservice now actively listening for requests.`);
  });
}
bootstrap();
