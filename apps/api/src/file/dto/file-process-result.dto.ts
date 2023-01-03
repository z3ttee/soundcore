import { MountScanFlag } from "../../mount/dtos/scan-process.dto";
import { Mount } from "../../mount/entities/mount.entity";
import { FileID } from "../entities/file.entity";
import { FileProcessFlag } from "./file-process.dto";

export class FileProcessResultDTO {
    constructor(
        public readonly mount: Mount,
        public readonly filesProcessed: FileID[],
        public readonly timeTookMs: number,
        public readonly flag: FileProcessFlag,
        public readonly scanFlag: MountScanFlag
    ) {}
}