import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { HEARTBEAT_INTERVAL, HEARTBEAT_MESSAGE_CHANNEL, HEARTBEAT_OPTIONS } from "../../constants";
import { Heartbeat } from "../../shared";
import { HeartbeatClientOptions } from "../heartbeat-client.module";

@Injectable()
export class HeartbeatClientService {

    private _interval: NodeJS.Timer;

    constructor(
        private readonly redis: Redis,
        @Inject(HEARTBEAT_OPTIONS) private readonly options: HeartbeatClientOptions
    ) {
        this.initialize();
    }

    private initialize() {
        this.sendHeartbeat();

        this._interval = setInterval(() => {
            this.sendHeartbeat();
        }, this.options.interval || HEARTBEAT_INTERVAL);
    }

    private async sendHeartbeat() {
        const dynamicPayload = await this.options.dynamicPayload();
        const staticPayload = this.options.staticPayload;

        const payload = {
            ...staticPayload,
            ...dynamicPayload
        }

        const heartbeat = new Heartbeat("defsoft", payload);
        this.redis.publish(HEARTBEAT_MESSAGE_CHANNEL, JSON.stringify(heartbeat));
    }

}