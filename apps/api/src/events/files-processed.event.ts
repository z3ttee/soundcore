import { File } from "../file/entities/file.entity";

export class FilesProcessedEvent {

    constructor(
        public readonly files: File[]
    ) {}

}