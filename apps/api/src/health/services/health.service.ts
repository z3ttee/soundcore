import { Injectable, NotFoundException } from "@nestjs/common";
import { Heartbeat, HeartbeatServerService, OnHeartbeat } from "@soundcore/heartbeat";
import { HealthReport } from "../entities/health.entity";

@Injectable()
export class HealthService {

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
    public handleHeartbeat(heartbeat: Heartbeat) {
        // Handle payload
    }

}