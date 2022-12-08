import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { JanitorService } from "../services/janitor.service";

@Injectable()
export class DeleteStreamsCronJob {

    constructor(
        private readonly service: JanitorService
    ) {}

    // Every even hour
    @Cron("0 0 0/2 * * *")
    public async deleteStreamsOlderThan30Days() {
        this.service.clearStreams();
    }

}