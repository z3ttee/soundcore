import { Artist } from "../../artist/entities/artist.entity";
import { Song } from "../../song/entities/song.entity";
import { User } from "../../user/entities/user.entity";
import { Album } from "../../album/entities/album.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { Label } from "../../label/entities/label.entity";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { Genre } from "../../genre/entities/genre.entity";

export type SearchBestMatchType = "song" | "artist" | "album" | "genre" | "publisher" | "label" | "distributor" | "playlist" | "user"
export class SearchBestMatch {

    public type: SearchBestMatchType;
    public match: Song | Artist | Album | Genre | Distributor | Label | Publisher | Playlist | User;

}