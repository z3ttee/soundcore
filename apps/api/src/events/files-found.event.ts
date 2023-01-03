import { FileDTO } from "../file/dto/file.dto";
import { MountScanFlag } from "../mount/dtos/scan-process.dto";
import { Mount } from "../mount/entities/mount.entity";

export class FilesFoundEvent {

    constructor(
        public readonly mount: Mount,
        public readonly files: FileDTO[],
        public readonly flag: MountScanFlag
    ) {}

}