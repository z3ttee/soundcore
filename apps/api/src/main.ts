import { Logger, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { Bootstrapper, Environment } from "@repo/bootstrap";

// Always bind to 0.0.0.0 when inside docker
const host = Environment.isDockerized ? "0.0.0.0" : (process.env.BIND_ADDRESS ?? "0.0.0.0");
// Always use port 3002 when inside docker
const port = Environment.isDockerized ? 3002 : (Number(process.env.PORT) ?? 3002)

const logger = new Logger("Bootstrap");

const bootstrapper = Bootstrapper.create(AppModule);
bootstrapper.setCors(true);
bootstrapper.setVersioning({ type: VersioningType.URI, defaultVersion: "1" })
bootstrapper.listen(port).then((app) => {
  app.getUrl().then((url) => {
    logger.log(`Soundcore Service now listening for requests on url '${url}'.`);
  });
});

