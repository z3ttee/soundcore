import { VersioningType } from "@nestjs/common";
import { Bootstrapper, Environment } from "@repo/bootstrap";
import { AppModule } from "./app.module";

// Always use port 3002 when inside docker
const port = Environment.isDockerized ? 3002 : (Number(process.env.PORT) ?? 3002);

const bootstrapper = Bootstrapper.create(AppModule);
bootstrapper.setCors(true);
bootstrapper.setVersioning({ type: VersioningType.URI, defaultVersion: "1" });
bootstrapper.listen(port);
