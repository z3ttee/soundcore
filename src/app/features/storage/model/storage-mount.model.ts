import { StorageBucket } from "./storage-bucket.model";

export type MountStatus = "ok" | "indexing";

export class StorageMount {
    
    public id: string;
    public path: string;
    public name: string;
    public status: MountStatus;
    public bucket: StorageBucket;

}