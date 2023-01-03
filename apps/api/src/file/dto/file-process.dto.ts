import { FileDTO } from "./file.dto";
import { Mount } from "../../mount/entities/mount.entity";
import { MountScanFlag } from "../../mount/dtos/scan-process.dto";

export enum FileProcessFlag {
    DEFAULT = "default",
    CONTINUE_AWAITING = "continue_awaiting_files"
}

export class FileProcessDTO {
    constructor(
        public readonly mount: Mount,
        public readonly files: FileDTO[],
        public readonly scanFlag: MountScanFlag,
        public readonly flag: FileProcessFlag
    ) {}
}