import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ZONE_HOSTNAME } from "../../constants";
import { EVENT_HEALTH_UPDATE, HEALTH_SERVICE } from "@soundcore/constants";
import { RedisSubscribe } from "@soundcore/redis";

@Injectable()
export class HealthService {

    constructor(
        @Inject(HEALTH_SERVICE) private readonly healthClient: ClientProxy,
        @Inject(ZONE_HOSTNAME) private readonly hostname: string
    ) {
        this.updateStatus();
    }

    @RedisSubscribe("test", true)
    public handleSubscribe(channel: string, payload: any) {
        console.log(channel, payload);
    }

    public updateStatus() {
        // this.healthClient.connect().catch((error: Error) => console.error(error)).then(() => {
        //     this.healthClient.emit(EVENT_HEALTH_UPDATE, { ok: true }).subscribe((result) => {
        //         console.log("updated health", result);
        //     })
        // })

        this.healthClient.emit<any>(EVENT_HEALTH_UPDATE, { ok: true }).subscribe(() => console.log("update sent"));

        // console.log("emit")
        // //
        // this.healthClient.emit(EVENT_HEALTH_UPDATE, { ok: true }).subscribe((result) => {
        //     console.log("updated health", result);
        // })
    }

    public initHeartbeat() {
        // 
    }

}