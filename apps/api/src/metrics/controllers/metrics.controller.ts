import { Controller, Get } from "@nestjs/common";
import { Roles } from "../../authentication/decorators/role.decorator";
import { ROLE_ADMIN } from "../../constants";
import { MetricsService } from "../services/metrics.service";

@Controller("metrics")
export class MetricsController {

    constructor(
        private readonly service: MetricsService
    ) {}

    @Roles(ROLE_ADMIN)
    @Get("device")
    public async findDeviceMetrics() {
        return this.service.findDeviceInfo();
    }

}