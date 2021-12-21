import { StorageMount } from "./storage-mount.model";

export class StorageBucket {

    public id: string;
    public machineId: string;
    public mounts: StorageMount[];

}