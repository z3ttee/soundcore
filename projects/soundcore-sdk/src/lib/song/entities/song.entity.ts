import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export class Song implements SCDKResource {
    public slug: string;
    public resourceType: SCDKResourceType;
    
    public id: string;
    public name: string;
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