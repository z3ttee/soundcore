import os from "node:os";
import { Injectable } from "@nestjs/common";
import { ApplicationMode, DeviceInfo } from "../entities/device-info.entity";
import { Environment } from "@repo/utilities";

@Injectable()
export class MetricsService {

    public async findDeviceInfo(): Promise<DeviceInfo> {
        return {
            arch: os.arch(),
            applicationMode: Environment.isDockerized ? ApplicationMode.DOCKER : ApplicationMode.STANDALONE,
            cpu: os.cpus().map((info) => ({
                model: info.model
            })),
            memory: {
                total: os.totalmem(),
                used: os.totalmem() - os.freemem()
            }
        }
    }

}