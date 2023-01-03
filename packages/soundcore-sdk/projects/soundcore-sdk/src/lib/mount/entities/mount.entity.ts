import { Bucket } from "../../bucket/entities/bucket.entity";

export enum MountStatus {
    UP = 0,
    ENQUEUED = 1,
    SCANNING = 2,
    INDEXING = 3
}

export class Mount {
    public id: string;
    public name: string;
    public directory: string;
    public createdAt: Date;
    public updatedAt: Date;
    public lastScannedAt: Date;
    public status: MountStatus;
    public isDefault: boolean;

    public bucket: Bucket;

    // Below fields may only be populated
    // after custom database queries.
    public filesCount?: number;
    public usedSpace?: number;

}