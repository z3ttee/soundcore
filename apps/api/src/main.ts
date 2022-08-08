import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true, abortOnError: false });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
  app.enableCors();

  const config = app.get(ConfigService);
  const port = config.get<number>("PORT") || 3001
  const logger = new Logger("Bootstrap");
  
  await app.listen(port).then(() => {
    logger.log(`Soundcore API now listening for requests on port ${port}`);
  });
}

bootstrap();
