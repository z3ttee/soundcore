import { Module } from "@nestjs/common";
import { ScanController } from "./controllers/scan.controller";
import { ScanService } from "./services/scan.service";

@Module({
    controllers: [
        ScanController
    ],
    providers: [
        ScanService
    ]
})
export class ScanModule {}