import { Page } from "../../pagination";
import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { Genre } from "../../genre/entities/genre.entity";
import { Label } from "../../label/entities/label.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { Song } from "../../song/entities/song.entity";
import { User } from "../../user/entities/user.entity";
import { SearchBestMatch } from "./best-match.entity";

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