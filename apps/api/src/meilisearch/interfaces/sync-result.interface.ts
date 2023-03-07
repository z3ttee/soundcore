import { Task } from "meilisearch";

export class SyncResult {

    constructor(
        public readonly task: Task,
        public readonly flag: any,
        public readonly err?: Error
    ) {}

}