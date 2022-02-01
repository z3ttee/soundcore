import { Album } from "../../album/entities/album.entity";
import { Song } from "../../song/entities/song.entity";
import { Artwork } from "../../../model/artwork.model";

export class Artist {

    public id: string;
    public geniusUrl: string;
    public description: string;
    public name: string;
    public registeredAt: Date;

    public songs?: Song[];
    public albums?: Album[];
    public banner?: Artwork;
    public artwork?: Artwork;

    public songCount?: number;
    public albumCount?: number;
    public streamCount?: number;
    public likedCount?: number;

}