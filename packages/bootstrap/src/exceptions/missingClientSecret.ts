import { ENV_CLIENT_SECRET_KEY } from "../constants";

export class MissingClientSecretException extends Error {
  constructor() {
    super(`Cannot find required environment variable ${ENV_CLIENT_SECRET_KEY}`);
  }
}
