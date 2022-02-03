import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { environment } from "src/environments/environment";
import { v4 as uuidv4 } from "uuid"
import { PlaylistViewType } from "../components/views/playlist-view/playlist-view.component";
import { Song } from "../features/song/entities/song.entity";
import { Page, Pageable } from "../pagination/pagination";

export type PlayableListType = PlaylistViewType | "topSongs" | "likedArtistSongs" | "random"
export class PlayableList {

    public readonly id: string = uuidv4();
    public readonly type: PlayableListType = "playlist"
    public readonly resourceId: string = this.id;
    public readonly startSongIndex: number = 0;
    public readonly pageSize: number = 50;

    private _nextPageIndex: number = 0;
    private _totalElements: number;
    private _isFetching: boolean = false;

    constructor(resourceId: string, type: PlayableListType, startSongIndex: number = 0) {
        this.resourceId = resourceId;
        this.type = type;
        this.startSongIndex = startSongIndex;
    }

    public static forArtist(resourceId: string) {
        const list = new PlayableList(resourceId, "artist");
        return list;
    }

    public static forCollection(startSongIndex: number = 0) {
        const list = new PlayableList("@me", "collection", startSongIndex);
        return list;
    }

    public static forPlaylist(resourceId: string, startSongIndex: number = 0) {
        const list = new PlayableList(resourceId, "playlist", startSongIndex);
        return list;
    }

    public static forAlbum(resourceId: string, startSongIndex: number = 0) {
        const list = new PlayableList(resourceId, "album", startSongIndex);
        return list;
    }

    public static forRandom(resourceId: string) {
        const list = new PlayableList(resourceId, "random");
        return list;
    }

    public get totalElements(): number {
        return this._totalElements;
    }
    public get nextPageIndex(): number {
        return this._nextPageIndex;
    }

    /**
     * Get the next batch of songs from this playable list.
     * This always fetches maximum of 50 songs at once.
     * @param httpClient This function needs an httpclient instance to fetch batches from backend.
     */
    public async fetchNextBatch(httpClient: HttpClient): Promise<Song[]> {
        if(this._isFetching) return [];
        this._isFetching = true;
        if(this.nextPageIndex-1 * this.pageSize >= this.totalElements) return [];

        return firstValueFrom(httpClient.get<Page<Song>>(`${environment.api_base_uri}/v1/playlists/song-list${this.getEndpoint()}${this.resourceId}${Pageable.toQuery({ page: this._nextPageIndex, size: this.pageSize })}`)).then((page) => {
            this._totalElements = page.totalElements;

            if(page.elements.length > 0) {
                this._nextPageIndex++;
                return page.elements;
            }

            return [];
        }).finally(() => this._isFetching = false)
    }

    private getEndpoint() {
        if(this.type == "artist") return "/byArtist/" // DONE
        if(this.type == "collection") return "/byCollection/"
        if(this.type == "playlist") return "/byPlaylist/" // DONE
        if(this.type == "topSongs") return "/byArtistTop/" // DONE
        if(this.type == "likedArtistSongs") return "/byCollection/byArtist/" // DONE
        if(this.type == "album") return "/byAlbum/" // DONE
        return "/byRandom/" // TODO: Add random songs
    }

}