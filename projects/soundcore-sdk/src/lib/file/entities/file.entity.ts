import { Mount } from "../../mount/entities/mount.entity";
import { Song } from "../../song/entities/song.entity";

export enum FileFlag {
    OK = 0,
    CORRUPT = 1,
    DELETED = 2,
    PROCESSING = 3,
    FAILED_SONG_CREATION = 4,
    DUPLICATE = 5
}

export class File {
    public id: string;
    public name: string;
    public directory: string;
    public size: number;
    public flag: FileFlag

    public song: Song;
    public mount: Mount;
}