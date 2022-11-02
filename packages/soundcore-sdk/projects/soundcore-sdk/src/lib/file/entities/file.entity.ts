import { Mount } from "../../mount/entities/mount.entity";
import { Song } from "../../song/entities/song.entity";

export enum FileFlag {
    PENDING_ANALYSIS = 0,
    OK = 1,
    POTENTIAL_DUPLICATE = 2,
    ERROR = 3
}

export class File {
    public id: string;
    public name: string;
    public directory: string;
    public pathHash: string;
    public size: number;
    public mimetype: string;
    public flag: FileFlag

    public song: Song;
    public mount: Mount;
}