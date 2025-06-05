import { Controller, Get } from "@nestjs/common";
import { MetricsService } from "../services/metrics.service";

@Controller("metrics")
export class MetricsController {
  constructor(private readonly service: MetricsService) {}

  @Get("device")
  public async findDeviceMetrics() {
    return this.service.findDeviceInfo();
  }
}
