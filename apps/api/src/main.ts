import { Logger, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { createBootstrap } from "@soundcore/bootstrap";
import { Environment } from '@soundcore/common';

// Always bind to 0.0.0.0 when inside docker
const host = Environment.isDockerized ? "0.0.0.0" : (process.env.BIND_ADDRESS ?? "0.0.0.0");
// Always use port 3002 when inside docker
const port = Environment.isDockerized ? 3002 : (Number(process.env.PORT) ?? 3002)

const logger = new Logger("Bootstrap");
createBootstrap("Soundcore @NEXT", AppModule)
  .useOptions({ cors: true, abortOnError: false })
  .enableCors()
  .enableVersioning({ type: VersioningType.URI, defaultVersion: "1" })
  .useHost(host)
  .usePort(port)
  .withBuildInfo()
  .bootstrap().then((app) => {
    app.getUrl().then((url) => {
      logger.log(`Soundcore Service now listening for requests on url '${url}'.`);      
    });
  });

