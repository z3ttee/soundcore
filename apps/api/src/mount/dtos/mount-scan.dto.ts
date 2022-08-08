import { Mount } from "../entities/mount.entity";
import { ProgressInfoDTO } from "../worker/progress-info.dto";

export class MountScanProcessDTO {

    constructor(
        public readonly mount: Mount,
        public progress?: ProgressInfoDTO
    ) {}

}