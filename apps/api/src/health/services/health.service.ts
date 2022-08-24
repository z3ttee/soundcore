import { Injectable } from "@nestjs/common";
import { Heartbeat, OnHeartbeat } from "@soundcore/heartbeat";

@Injectable()
export class HealthService {

    @OnHeartbeat()
    public handleHeartbeat(heartbeat: Heartbeat) {
        // Handle payload
    }

}