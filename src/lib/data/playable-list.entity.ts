import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, firstValueFrom, Observable, Subject, takeUntil } from "rxjs";
import { PlaylistViewType } from "src/app/components/views/playlist-view/playlist-view.component";
import { Song } from "src/app/features/song/entities/song.entity";
import { Page, Pageable } from "src/app/pagination/pagination";
import { environment } from "src/environments/environment";

export const PLAYLIST_BATCH_SIZE = 50;

export type PlayableListType = PlaylistViewType | "topSongs" | "likedArtistSongs" | "random"
export class PlayableList<T> {
    private readonly _destroySubject: Subject<void> = new Subject();
    private readonly _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private readonly _readySubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private readonly _dataSourceSubject: BehaviorSubject<Song[]> = new BehaviorSubject([]);
    private readonly _errorSubject: Subject<Error> = new Subject();
    private readonly _totalElementsSubject: BehaviorSubject<number> = new BehaviorSubject(0);
    private readonly _currentPageIndexSubject: BehaviorSubject<number> = new BehaviorSubject(0);

    public readonly type: PlayableListType;
    public readonly context: T;
    public readonly id: string;

    private readonly $destroy: Observable<void> = this._destroySubject.asObservable();
    public readonly $dataSource: Observable<Song[]> = this._dataSourceSubject.asObservable().pipe(takeUntil(this.$destroy));
    public readonly $isLoading: Observable<boolean> = this._loadingSubject.asObservable().pipe(takeUntil(this.$destroy));
    public readonly $isReady: Observable<boolean> = this._readySubject.asObservable().pipe(takeUntil(this.$destroy));
    public readonly $error: Observable<Error> = this._errorSubject.asObservable().pipe(takeUntil(this.$destroy));
    public readonly $totalElements: Observable<number> = this._totalElementsSubject.asObservable().pipe(takeUntil(this.$destroy));
    public readonly $currentPageIndex: Observable<number> = this._currentPageIndexSubject.asObservable().pipe(takeUntil(this.$destroy));

    private readonly _dataSource: Record<string, Song> = {};
    private readonly _resources: Record<string, Song> = {};
    private readonly _resourcesQueue: string[] = [];

    private readonly _httpClient: HttpClient;
    private readonly _metadataUrl: string;
    private readonly _listUrl: string;

    // TODO: private readonly _shuffled: boolean = false;

    private _currentPageIndex: number = 0;
    private _totalElements: number = 0;

    constructor(type: PlayableListType, httpClient: HttpClient, listUrl: string, metadataUrl: string, context: T) {
        this.id = PlayableList.buildId(type, context["id"])
        this.type = type;
        this.context = context;

        this._httpClient = httpClient;
        this._metadataUrl = metadataUrl;
        this._listUrl = listUrl;

        this.fetchSongsList();
    }

    public static buildId(type: PlayableListType, contextId: string) {
        return `${type.toString().toLowerCase()}_${contextId}`
    }

    /**
     * Get the current list of songs
     * in the $dataSource observable.
     */
    public get dataSource(): Song[] {
        return this._dataSourceSubject.getValue();
    }

    /**
     * Get the current amount of queued songs
     * of the playable list.
     */
    public get queueSize(): number {
        return this._resourcesQueue.length;
    }

    /**
     * Destroy subscriptions to prevent
     * memory leaks.
     */
    public destroy() {
        this._destroySubject.next();
        this._destroySubject.complete();
    }
    
    /**
     * Fetches the next page based on internal current page index.
     * @returns 
     */
    public async fetchNextPage() {
        const isLoading = this._loadingSubject.getValue();
        if(isLoading) return;

        console.log("fetching next page")
        this._loadingSubject.next(true);
        firstValueFrom(this._httpClient.get<Page<Song>>(this._metadataUrl+Pageable.toQuery({ page: this._currentPageIndex, size: PLAYLIST_BATCH_SIZE }))).then((page) => {
            console.log(page)
            // Update totalElements count
            this._totalElements = page.totalElements;
            this._totalElementsSubject.next(page.totalElements);
            
            if(page.elements.length > 0) {
                // Update page index
                this._currentPageIndex++;
                this._currentPageIndexSubject.next(this._currentPageIndex);

                const length = page.elements.length;
                let i = 0;

                while (i < length) {
                    const song = page.elements[i];
                    if(song) this._dataSource[song.id] = song;
                    i++;
                }

                this._dataSourceSubject.next(Object.values(this._dataSource))
            }
        }).catch((error: Error) => {
            // Emit error
            this._errorSubject.next(error);
        }).finally(() => {
            // Set loading back to false
            this._loadingSubject.next(false);
        })
    }

    /**
     * Retrieve complete list of songs for a playable list.
     * This functions makes use of the "listUrl" property.
     * NOTE: Song objects retrieved via the "listURL" only contain
     * valid ids, no other properties are populated.
     */
    private async fetchSongsList() {
        console.log("getting songs list")
        this._readySubject.next(false);

        // Fetch first page
        this.fetchNextPage().catch((error) => {
            this._errorSubject.next(error);
        })

        // Retrieve complete songs list (only contains song ids)
        firstValueFrom(this._httpClient.get<Page<Song>>(this._listUrl)).then((page) => {
            console.log(page)

            this._totalElements = page.totalElements;
            const length = page.elements.length;

            let i = 0;
            while (i < length) {
                const song = page.elements[i];
                if(song) this._resources[song.id] = song;
                i++;
            }

            this._resourcesQueue.push(...Object.keys(this._resources));
            return 
        }).catch((error: Error) => {
            // Emit error
            this._errorSubject.next(error);
        }).finally(() => {
            // Set status to ready, so songs can be played
            this._readySubject.next(true);
        })
    }

    /**
     * Emits the next song of the playable list.
     * This returns an observable, because it may happen that the 
     * song's metadata needs to be fetched. The observable emits 
     * exactly two times: First one is always the song's id as this value 
     * is always present. The last emit represents the song's metadata
     * @returns Observable<Song>
     */
    public async emitNextSong(startAtIndex?: number): Promise<Song> {
        const nextKey = startAtIndex ? this._resourcesQueue.splice(startAtIndex, 1)?.[0] : this._resourcesQueue.splice(0, 1)?.[0]
        const nextSong = this._resources[nextKey];

        if(!nextKey || !nextSong) return null

        // Next song exists, delete from queue and resources

        delete this._resources[nextKey];
        console.log("next song: ", nextSong)

        const metadata = this._dataSource[nextKey];

        // If metadata already fetched, return it
        if(metadata) return metadata;
                
        // Otherwise fetch and return it afterwards
        // Also add it to the dataset, so the playlist doesn't have to fetch this song again (except if its in batch request)
        return firstValueFrom(this._httpClient.get<Song>(`${environment.api_base_uri}/v1/songs/${nextKey}`).pipe(takeUntil(this.$destroy))).then((song) => {
            this._dataSource[song.id] = song;
            this._dataSourceSubject.next(Object.values(this._dataSource))
            return song;
        }).catch((error: Error) => {
            this._errorSubject.next(error)
            return null;
        })
    }

    public async addSong(song: Song) {
        this._resources[song.id] = song;
        this._resourcesQueue.push(song.id);
        this._dataSource[song.id] = song;
        this._dataSourceSubject.next(Object.values(this._dataSource));
    }

    public async addSongBulk(songs: Song[]) {
        for(const song of songs) {
            await this.addSong(song);
        }
    }

    public async removeSong(song: Song) {
        const index = this._resourcesQueue.findIndex((id) => id == song.id);
        if(index != -1) this._resourcesQueue.splice(index, 1);

        delete this._resources[song.id];
        delete this._dataSource[song.id];

        this._dataSourceSubject.next(Object.values(this._dataSource));

        this._totalElements--;
        this._totalElementsSubject.next(this._totalElements);
    }

    public async removeSongBulk(songs: Song[]) {
        for(const song of songs) {
            await this.removeSong(song);
        }
    }

}