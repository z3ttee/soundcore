import { Controller, Get } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RedisContext } from "@nestjs/microservices";
import { EVENT_HEALTH_UPDATE } from "@soundcore/constants";
import { Public } from "../../authentication/decorators/public.decorator";

@Controller("health")
export class HealthController {

    @Public(true)
    @Get()
    public async getHealth() {
        return {
            status: "running"
        }
    }

    @EventPattern(EVENT_HEALTH_UPDATE)
    @MessagePattern(EVENT_HEALTH_UPDATE)
    public handleHealthUpdate(@Payload() payload: any, @Ctx() context: RedisContext) {
        // console.log(payload, context);

        console.log("received update", payload)
    }
    
}