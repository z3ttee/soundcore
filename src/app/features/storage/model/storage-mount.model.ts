import { StorageBucket } from "./storage-bucket.model";

export class StorageMount {
    
    public id: string;
    public path: string;
    public name: string;
    public bucket: StorageBucket;

}