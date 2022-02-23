import { Song } from "../../song/entities/song.entity";
import { Mount } from "../../storage/entities/mount.entity";
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
    public mount?: Mount;
    public uploader?: User;
}