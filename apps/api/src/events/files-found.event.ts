import { FileDTO } from "../mount/dtos/file.dto";
import { Mount } from "../mount/entities/mount.entity";

export class FilesFoundEvent {

    constructor(
        public readonly mount: Mount,
        public readonly files: FileDTO[]
    ) {}

}