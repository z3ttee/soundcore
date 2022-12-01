import { Mount } from "../entities/mount.entity";

export enum MountScanFlag {
    DEFAULT_SCAN = 0,
    RESCAN = 1
}

export class MountScanProcessDTO {

    constructor(
        public readonly mount: Mount,
        public readonly flag: MountScanFlag
    ) {}

}