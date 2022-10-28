import { Song } from "../../song/entities/song.entity";
import { User } from "../../user/entities/user.entity";
import { Mount } from "./mount.entity";
import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export type IndexStatus = "ok" | "preparing" | "processing" | "errored" | "duplicate" | "uploading" | "aborted"
export class Index implements SCDKResource {
    public resourceType: SCDKResourceType;

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