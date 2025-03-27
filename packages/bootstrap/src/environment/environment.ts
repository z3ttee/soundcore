import dotenv from "dotenv";
import { DefaultServiceInfo, ServiceInfo } from "../entities/service-info.entity";
import { readServiceInfoSync } from "../utils/readServiceInfo";

// First read local .env.dev file
dotenv.config({ path: ".env.dev" });
// Read .env file
dotenv.config();

class EnvironmentImpl {
  constructor(
    /**
     * Property that contains the
     * current environment.
     * This will be `true`, if the environment is set to `development`.
     * Otherwise it will be `false`
     */
    public readonly isDev: boolean,
    /**
     * Property that can be used to
     * print logs when in debug mode.
     */
    public readonly isDebug: boolean,
    /**
     * Property that can be used to check if
     * the application is running inside a docker
     * container. During build time of containers for production,
     * the env variable will automatically be set to `true`
     */
    public readonly isDockerized: boolean,
    /**
     * Id of the service's client to
     * identify itself when communicating with
     * other services
     */
    public readonly client_id: string,
    /**
     * Secret key of the service that is used
     * to authenticate the client when communicating
     * with other services
     */
    public readonly client_secret?: string
  ) {}
}

let service_info: ServiceInfo;
try {
  service_info = readServiceInfoSync();
} catch (err) {
  service_info = DefaultServiceInfo;
}

const Environment = new EnvironmentImpl(
  process?.env?.PRODUCTION === "false",
  process?.env?.DEBUG == "true",
  process?.env?.DOCKERIZED == "true",
  service_info.client_id,
  service_info.client_secret
);
Object.freeze(Environment);

export default Environment;
