import { Inject, Injectable, Logger } from "@nestjs/common";
import { MODULE_OPTIONS_TOKEN } from "../constants";
import { WorkerModuleOptions } from "../worker.module";

@Injectable()
export class WorkerService {
    private readonly logger = new Logger(WorkerService.name);

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN) private readonly options: WorkerModuleOptions
    ) {
        if(this.options.debug) {
            this.logger.verbose(`Module options: ${JSON.stringify(options)}`);
        }
    }

}