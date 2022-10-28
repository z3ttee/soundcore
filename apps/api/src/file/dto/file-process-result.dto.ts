import { Mount } from "../../mount/entities/mount.entity";
import { File } from "../entities/file.entity";

export class FileProcessResultDTO {
    constructor(
        public readonly mount: Mount,
        public readonly filesProcessed: File[],
        public readonly timeTookMs: number
    ) {}
}