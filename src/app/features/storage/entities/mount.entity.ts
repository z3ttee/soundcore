import { Bucket } from "./bucket.entity";

export type MountStatus = "ok" | "indexing";

export class Mount {
    
    public id: string;
    public path: string;
    public name: string;
    public status: MountStatus;
    public bucket: Bucket;

    public indexCount?: number;
    public driveStats?: {
        driveTotalSpace?: number,
        driveUsedSpace?: number,
        mountUsedSpace?: number
    }

}