import { Page } from "../../../pagination/pagination";
import { Artist } from "../../artist/entities/artist.entity";
import { Song } from "../../song/entities/song.entity";
import { Distributor } from "src/app/model/distributor.entity";
import { Label } from "src/app/model/label.model";
import { Publisher } from "src/app/model/publisher.model";
import { Genre } from "src/app/model/genre.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { SearchBestMatch } from "./best-match.entity";
import { User } from "../../user/entities/user.entity";
import { Album } from "../../album/entities/album.entity";

export class ComplexSearchResult {

    public songs: Page<Song>;
    public artists: Page<Artist>;
    public albums: Page<Album>;

    public playlists: Page<Playlist>;

    public genres: Page<Genre>;
    
    public distributors: Page<Distributor>;
    public labels: Page<Label>;
    public publisher: Page<Publisher>;
    public users: Page<User>;

    public bestMatch?: SearchBestMatch;
    

}