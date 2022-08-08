import { File } from "../../file/entities/file.entity";

export enum IndexerProcessMode {
    SCAN = 0,
    RESCAN = 1
}

export class IndexerProcessDTO {

    constructor(
        public readonly file: File,
        public readonly mode: IndexerProcessMode = IndexerProcessMode.SCAN
    ) {}

}