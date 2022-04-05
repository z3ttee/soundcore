import { Artist } from "../../artist/entities/artist.entity";
import { Song } from "../../song/entities/song.entity";
import { Distributor } from "src/app/model/distributor.entity";
import { Label } from "src/app/model/label.model";
import { Publisher } from "src/app/model/publisher.model";
import { Genre } from "src/app/model/genre.entity";
import { User } from "../../user/entities/user.entity";
import { Album } from "../../album/entities/album.entity";
import { Playlist } from "soundcore-sdk";

export type SearchBestMatchType = "song" | "artist" | "album" | "genre" | "publisher" | "label" | "distributor" | "playlist" | "user"
export class SearchBestMatch {

    public type: SearchBestMatchType;
    public match: Song | Artist | Album | Genre | Distributor | Label | Publisher | Playlist | User;

}