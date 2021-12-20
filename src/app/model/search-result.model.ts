import { Page } from "../pagination/pagination";
import { Artist } from "./artist.model";
import { Song } from "./song.model";

export class ComplexSearchResult {

    public songs: Page<Song>;
    public artists: Page<Artist>;

}