import { FileID } from "../file/entities/file.entity";
import { MountScanFlag } from "../mount/dtos/scan-process.dto";
import { Mount } from "../mount/entities/mount.entity";

export class FilesProcessedEvent {

    constructor(
        public readonly files: FileID[],
        public readonly mount: Mount,
        public readonly scanFlag: MountScanFlag
    ) {}

}