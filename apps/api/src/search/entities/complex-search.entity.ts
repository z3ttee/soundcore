import { Page } from "nestjs-pager";
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

    public bestMatch?: SearchBestMatch;

    public songs?: Page<Song>;
    public artists?: Page<Artist>;
    public albums?: Page<Album>;
    public genres?: Page<Genre>;
    public publisher?: Page<Publisher>;
    public labels?: Page<Label>;
    public distributors?: Page<Distributor>;
    public users?: Page<User>;
    public playlists?: Page<Playlist>;

}