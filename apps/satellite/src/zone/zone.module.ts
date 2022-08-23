import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import os from "node:os";
import { ZONE_HOSTNAME } from "../constants";
import { Zone } from "./entities/zone.entity";


@Module({
    providers: [
        {
            provide: ZONE_HOSTNAME,
            useValue: os.hostname()
        }
    ],
    imports: [
        // TypeOrmModule.forFeature([ Zone ])
    ],
    exports: [
        ZONE_HOSTNAME
    ]
})
export class ZoneModule {}