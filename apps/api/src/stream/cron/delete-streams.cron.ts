import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { StreamService } from "../services/stream.service";

// TODO: Maybe create cron worker queue for such things as they may take a long time to complete?
@Injectable()
export class DeleteStreamsCronJob {
    private readonly logger = new Logger("StreamCron");

    constructor(
        private readonly service: StreamService
    ) {}

    @Cron("0 0 0/2 * * *")
    public async deleteStreamsOlderThan30Days() {
        this.logger.log(`Clearing stream records older than 30 days.`);
        this.service.clearStreamRecords();
    }

}