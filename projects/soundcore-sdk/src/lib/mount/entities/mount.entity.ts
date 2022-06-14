import { Bucket } from "../../bucket/entities/bucket.entity";
import { MountStatus } from "../enums/mount-status.enum";

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