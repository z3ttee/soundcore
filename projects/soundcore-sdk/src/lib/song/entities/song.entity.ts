import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";

export class Song {
    public id: string;
    public title: string;
    public duration: number;
    public released: Date;
    public description: string;
    public explicit: boolean;

    public artwork: Artwork;
    public artists: Artist[];
    public albums: Album[];
    public playlists: Playlist[];

    public streamCount: number;
    public liked: boolean;
    public likedAt: Date;
}