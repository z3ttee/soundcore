import { Song } from "./song.model";

export class Publisher {
    public id: string;
    public geniusId?: string;
    public name: string;
    public songs?: Song[]
}