import { FileDTO } from "./file.dto";

export class MountScanResultDTO {

    constructor(
        public readonly files: FileDTO[],
        public readonly timeMs: number
    ) {}

}