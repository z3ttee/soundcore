import { Inject, Injectable } from "@nestjs/common";
import { RedisPub } from "@soundcore/redis";
import { HEARTBEAT_INTERVAL, HEARTBEAT_MESSAGE_CHANNEL, HEARTBEAT_OPTIONS } from "../../constants";
import { Heartbeat } from "../../shared";
import { HeartbeatClientOptions } from "../heartbeat-client.module";

@Injectable()
export class HeartbeatClientService {

    private _interval: NodeJS.Timer;

    constructor(
        private readonly redisPub: RedisPub,
        @Inject(HEARTBEAT_OPTIONS) private readonly options: HeartbeatClientOptions
    ) {
        this.initialize();
    }

    private initialize() {
        this._interval = setInterval(() => {
            const heartbeat = new Heartbeat("defsoft", this.options.staticPayload || undefined);
            this.redisPub.publish(HEARTBEAT_MESSAGE_CHANNEL, JSON.stringify(heartbeat));
        }, this.options.interval || HEARTBEAT_INTERVAL);
    }

}