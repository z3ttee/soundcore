import { FileDTO } from "../../file/dto/file.dto";
import { Mount } from "../entities/mount.entity";
import { MountScanFlag } from "./scan-process.dto";

export class MountScanResultDTO {

    constructor(
        public readonly mount: Mount,
        public readonly files: FileDTO[],
        public readonly totalFiles: number,
        public readonly timeMs: number,
        public readonly flag: MountScanFlag = MountScanFlag.DEFAULT_SCAN
    ) {}

}