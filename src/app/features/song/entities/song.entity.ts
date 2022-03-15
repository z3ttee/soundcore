import { Artist } from "src/app/features/artist/entities/artist.entity";
import { Artwork } from "src/app/model/artwork.model";
import { Distributor } from "src/app/model/distributor.entity";
import { Genre } from "src/app/model/genre.entity";
import { Label } from "src/app/model/label.model";
import { Publisher } from "src/app/model/publisher.model";
import { Album } from "../../album/entities/album.entity";
import { PlaylistItem } from "../../playlist/entities/playlist-item.entity";
import { StreamToken } from "../../stream/entities/stream-token.entity";
import { Index } from "../../upload/entities/index.entity";

export class Song {

    public id: string;
    public geniusUrl: string;
    public title: string;
    public duration: number;
    public location: string;
    public youtubeUrl: string;
    public youtubeUrlStart: string;
    public released: Date;
    public createdAt: Date;
    public explicit: boolean;
    public description: string;
    public slug: string;

    public artwork?: Artwork;
    public banner?: Artwork;

    public artists?: Artist[];
    public publisher?: Publisher;
    public distributor?: Distributor;
    public label?: Label;
    public albums?: Album[];
    public genres?: Genre[];
    public index?: Index;

    // public song2playlist?: Date;
    public playlists?: PlaylistItem[];
    public streamCount?: number;

    public liked?: boolean;
    public likedAt?: Date;

}