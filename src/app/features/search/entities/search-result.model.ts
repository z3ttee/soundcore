import { Page } from "../../../pagination/pagination";
import { Artist } from "../../../model/artist.model";
import { Song } from "../../../model/song.model";

export class ComplexSearchResult {

    public songs: Page<Song>;
    public artists: Page<Artist>;

}