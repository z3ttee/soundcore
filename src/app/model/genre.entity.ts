import { Song } from "../features/song/entities/song.entity";

export class Genre {
    public id: string;
    public name: string;
    public slug: string;

    public songs?: Song[];
}