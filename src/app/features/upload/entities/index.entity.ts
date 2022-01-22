import { Song } from "../../song/entities/song.entity";
import { StorageMount } from "../../storage/model/storage-mount.model";
import { User } from "../../user/entities/user.entity";
import { IndexStatus } from "../enums/index-status.enum";

export class Index {
    public id: string;
    public filename: string;
    public size: number;
    public status: IndexStatus;
    public checksum: string;
    public indexedAt: Date;
    
    public song?: Song;
    public mount?: StorageMount;
    public uploader?: User;
}