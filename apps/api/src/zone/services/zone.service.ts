import os from "os"
import { Injectable, NotFoundException } from '@nestjs/common';
import { Zone, ZoneEnv, ZoneStatus } from '../entities/zone.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileSystemService } from '../../filesystem/services/filesystem.service';
import { Environment, Page, Pageable } from "@soundcore/common";

@Injectable()
export class ZoneService {

    constructor(
        private readonly fileSystem: FileSystemService,
        @InjectRepository(Zone) private readonly repository: Repository<Zone>,
    ){}

    /**
     * Find a page of zones.
     * @param pageable Page settings
     * @returns Page<Zone>
     */
    public async findPage(pageable: Pageable): Promise<Page<Zone>> {
        const query = await this.repository.createQueryBuilder("zone")
            // Select the amount of mounts
            .loadRelationCountAndMap("zone.mountsCount", "zone.mounts", "mountsCount")
            // Get used space for every zone by
            // summing up the used space of every
            // file on mounts inside the zone.
            .leftJoin("zone.mounts", "mount")
            .leftJoin("mount.files", "file")
            .addSelect("SUM(file.size) AS usedSpace")
            // Pagination
            .offset(pageable.offset)
            .limit(pageable.limit)
            .groupBy("zone.id");

        const result = await query.getRawAndEntities();
        const totalElements = await query.getCount();
        return Page.of(result.entities.map((zone, index) => {
            zone.usedSpace = result.raw[index]?.usedSpace || 0;
            return zone;
        }), totalElements, pageable);
    }

    /**
     * Find a zone by its id.
     * @param zoneId Zone's id
     * @returns Zone
     */
    public async findById(zoneId: string): Promise<Zone> {
        const result = await this.repository.createQueryBuilder("zone")
            // Select the amount of mounts
            .loadRelationCountAndMap("zone.mountsCount", "zone.mounts", "mountsCount")
            // Get used space for every zone by
            // summing up the used space of every
            // file on mounts inside the zone.
            .leftJoin("zone.mounts", "mount")
            .leftJoin("mount.files", "file")
            .addSelect("SUM(file.size) AS usedSpace")
            .groupBy("zone.id")
            .where("zone.id = :zoneId", { zoneId })
            .getRawAndEntities()

        const zone = result.entities[0];
        if(!zone) throw new NotFoundException("Zone not found");
        
        zone.usedSpace = result.raw[0].usedSpace;
        return zone;
    }

    /**
     * Initialize local zone. If the local instance has not yet
     * registered a zone in the database, then a new one is created.
     * @returns {Zone} Initialized zone instance
     */
    public async initializeLocalZone(): Promise<Zone> {
        const localZoneId = this.fileSystem.getInstanceId();

        return this.repository.createQueryBuilder()
            .insert()
            .values({
                id: localZoneId,
                name: this.formatName(os.hostname()),
                status: ZoneStatus.UP,
                environment: Environment.isDockerized ? ZoneEnv.DOCKER : ZoneEnv.STANDALONE,
                platform: process.platform,
                arch: process.arch,
            })
            .orUpdate(["name", "status", "environment", "platform", "arch"], ["id"])
            .execute().then(() => this.findById(localZoneId));
    }

    public formatName(input: string): string {
        return input.slice(0, Math.min(254, input.length));
    }

}
