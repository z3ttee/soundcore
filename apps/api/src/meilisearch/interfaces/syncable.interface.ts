
export enum SyncFlag {
    AWAITING = 0,
    OK = 1,
    ERROR = 2
}

// TODO: Create cronjob that periodically checks for sync errors. If there occured errors (SyncFlag = 1), then sync again

export interface Syncable {

    /**
     * Property that holds the date
     * at when the entity last got synced
     * with the meilisearch instance.
     */
    lastSyncedAt: Date;

    /**
     * Indicates if the sync was successful or not
     */
    lastSyncFlag: SyncFlag;

}