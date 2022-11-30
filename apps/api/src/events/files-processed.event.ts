import { File } from "../file/entities/file.entity";
import { Mount } from "../mount/entities/mount.entity";

export class FilesProcessedEvent {

    constructor(
        public readonly files: File[],
        public readonly mount?: Mount
    ) {}

}