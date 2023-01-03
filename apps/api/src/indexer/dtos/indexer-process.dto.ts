import { FileID } from "../../file/entities/file.entity";
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
        public readonly fileIds: FileID[],
        public readonly mount: Mount,
        public readonly type: IndexerProcessType = IndexerProcessType.DEFAULT
    ) {}

}