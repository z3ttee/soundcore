import { ClientStatus, HeartbeatReport } from "..";
import { Latency } from "./latency.entity";

export class Health {

    constructor(
        public readonly clientId: string,
        public status: ClientStatus,
        public network: Latency,
        public heartbeat: HeartbeatReport
    ) {}

}