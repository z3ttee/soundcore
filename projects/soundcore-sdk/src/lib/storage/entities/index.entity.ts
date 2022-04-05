import { Song } from "../../song/entities/song.entity";
import { User } from "../../user/entities/user.entity";
import { Mount } from "./mount.entity";

export type IndexStatus = "ok" | "preparing" | "processing" | "errored" | "duplicate" | "uploading" | "aborted"
export class Index {
    public id: string;
    public filename: string;
    public size: number;
    public status: IndexStatus;
    public checksum: string;
    public indexedAt: Date;
    public directory: string;

    public song?: Song;
    public mount?: Mount;
    public uploader?: User;
}