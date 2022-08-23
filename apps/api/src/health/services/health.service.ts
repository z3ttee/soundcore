import { Injectable } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RedisContext } from "@nestjs/microservices";
import { EVENT_HEALTH_UPDATE } from "@soundcore/constants";
import { RedisSubscribe } from "@soundcore/redis";

@Injectable()
export class HealthService {

    @RedisSubscribe(EVENT_HEALTH_UPDATE, true)
    public handleHealthUpdate(channel: string, payload: any) {
        
    }

}