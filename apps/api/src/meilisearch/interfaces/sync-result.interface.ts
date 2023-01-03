import { Task } from "meilisearch";
import { SyncFlag } from "./syncable.interface";

export class SyncResult {

    constructor(
        public readonly task: Task,
        public readonly flag: SyncFlag,
        public readonly err?: Error
    ) {}

}