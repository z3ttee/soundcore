import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Heartbeat, HeartbeatServerService, OnHeartbeat } from "@soundcore/heartbeat";
import { HealthReport } from "../entities/health.entity";

@Injectable()
export class HealthService {
    // private readonly _logger: Logger = new Logger(HealthService.name);

    constructor(
        private readonly heartbeatService: HeartbeatServerService
    ) {}

    public async findHealthByClientId(clientId: string) {
        if(!await this.heartbeatService.existsClientId(clientId)) throw new NotFoundException("Client not found");
        return this.heartbeatService.findHealthReportByClientId(clientId);
    }

    public async findHealthOverview(): Promise<HealthReport> {
        const reports = await this.heartbeatService.findAllHealthReports();
        return new HealthReport(reports);
    }

    @OnHeartbeat()
    public onHeartbeat(heartbeat: Heartbeat) {
        console.log(heartbeat);
    }

}