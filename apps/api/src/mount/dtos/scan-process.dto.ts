import { Mount } from "../entities/mount.entity";

export enum MountScanFlag {
    DEFAULT_SCAN = "scan",
    RESCAN = "rescan",
    DOCKER_LOOKUP = "docker-lookup"
}

export class MountScanProcessDTO {

    constructor(
        public readonly flag: MountScanFlag,
        public readonly mount: Mount,
    ) {}

}