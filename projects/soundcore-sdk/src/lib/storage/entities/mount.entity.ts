import { Bucket } from "./bucket.entity";
import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export type MountStatus = "ok" | "indexing";

export class Mount implements SCDKResource {
    public resourceType: SCDKResourceType;
    
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