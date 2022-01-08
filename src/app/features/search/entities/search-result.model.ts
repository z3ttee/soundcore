import { Page } from "../../../pagination/pagination";
import { Artist } from "../../../model/artist.model";
import { Song } from "../../song/entities/song.entity";
import { Album } from "src/app/model/album.model";
import { Distributor } from "src/app/model/distributor.entity";
import { Label } from "src/app/model/label.model";
import { Publisher } from "src/app/model/publisher.model";
import { Genre } from "src/app/model/genre.entity";

export class ComplexSearchResult {

    public songs: Page<Song>;
    public artists: Page<Artist>;
    public albums: Page<Album>;
    // TODO: Playlist typing
    public playlists: Page<any>;

    public genres: Page<Genre>;
    
    public distributors: Page<Distributor>;
    public labels: Page<Label>;
    public publisher: Page<Publisher>;
    

}