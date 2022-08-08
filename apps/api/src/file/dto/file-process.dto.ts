import { FileDTO } from "../../mount/dtos/file.dto";
import { File } from "../entities/file.entity";

export enum FileProcessMode {
    SCAN = 0,
    RESCAN
}

export class FileProcessDTO {
    constructor(
        public readonly file: FileDTO,
        public readonly mode: FileProcessMode = FileProcessMode.SCAN,
        public result?: File
    ) {}
}