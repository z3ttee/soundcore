import { UpdateResult } from "typeorm";

export interface SyncableService<R = any> {

    syncWithMeilisearch(resources: R[]): Promise<UpdateResult>

}