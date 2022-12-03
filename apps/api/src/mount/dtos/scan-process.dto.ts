import { Mount } from "../entities/mount.entity";

export enum MountScanFlag {
    DEFAULT_SCAN = "scan",
    RESCAN = "rescan"
}

export class MountScanProcessDTO {

    constructor(
        public readonly flag: MountScanFlag,
        public readonly mount: Mount,
    ) {}

}