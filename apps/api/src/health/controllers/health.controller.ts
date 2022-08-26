import { Controller, Get, Param } from "@nestjs/common";
import { HealthService } from "../services/health.service";

@Controller("health")
export class HealthController {

    constructor(
        private readonly service: HealthService
    ) {}

    @Get()
    public async findHealthOverview() {
        return this.service.findHealthOverview();
    }

    @Get(":clientId")
    public async findHealthByClientId(@Param("clientId") clientId: string) {
        return this.service.findHealthByClientId(clientId);
    }
    
}