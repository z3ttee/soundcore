import { Page } from "../../../pagination/pagination";
import { Artist } from "../../../model/artist.model";
import { Song } from "../../song/entities/song.entity";

export class ComplexSearchResult {

    public songs: Page<Song>;
    public artists: Page<Artist>;

}