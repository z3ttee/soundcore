import { Song } from "src/app/model/song.model";
import { SSOUser } from "src/app/model/sso-user.model";
import { StorageMount } from "../../storage/model/storage-mount.model";
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
    public uploader?: SSOUser;
}