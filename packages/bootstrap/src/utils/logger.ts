import { Logger } from "@nestjs/common";
import { LOG_LABEL } from "../constants";

const logger = new Logger(LOG_LABEL);
export default logger;

export const BOOTSTRAP_LOGGER = logger;
