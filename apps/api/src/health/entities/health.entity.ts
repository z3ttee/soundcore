import { Health } from "@soundcore/heartbeat";

export class HealthReport {

    constructor(
        public readonly clients: Health[]
    ) {}

}