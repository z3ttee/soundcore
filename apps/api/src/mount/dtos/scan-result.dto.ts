import { FileDTO } from "./file.dto";
import { MountScanFlag } from "./scan-process.dto";

export class MountScanResultDTO {

    constructor(
        public readonly files: FileDTO[],
        public readonly totalFiles: number,
        public readonly timeMs: number,
        public readonly flag: MountScanFlag = MountScanFlag.DEFAULT_SCAN
    ) {}

}