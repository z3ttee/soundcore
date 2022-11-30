import { File } from "../../file/entities/file.entity";
import { Mount } from "../../mount/entities/mount.entity";

export enum IndexerProcessMode {
    SCAN = 0,
    RESCAN = 1
}

export enum IndexerProcessType {
    DEFAULT = 0,
    FLAG_BASED = 1
}

export class IndexerProcessDTO {

    constructor(
        public readonly files: File[],
        public readonly type: IndexerProcessType = IndexerProcessType.DEFAULT,
        public readonly mount?: Mount
    ) {}

}