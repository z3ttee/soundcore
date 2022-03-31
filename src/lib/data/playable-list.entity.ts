import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, combineLatest, firstValueFrom, map, Observable, Subject, takeUntil } from "rxjs";
import { PlaylistViewType } from "src/app/components/views/playlist-view/playlist-view.component";
import { Song } from "src/app/features/song/entities/song.entity";
import { Page, Pageable } from "src/app/pagination/pagination";
import { environment } from "src/environments/environment";
import { SCResourceList, SCResourceMap, SCResourceMapQueue } from "./resource";

export const PLAYLIST_BATCH_SIZE = 50;

export type PlayableListType = PlaylistViewType | "topSongs" | "likedArtistSongs" | "random"
export class PlayableList<T> {
    private readonly _destroySubject: Subject<void> = new Subject();
    private readonly _readySubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private readonly _fetchingStateSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private readonly _errorSubject: Subject<Error> = new Subject();
    private readonly _totalElementsSubject: BehaviorSubject<number> = new BehaviorSubject(0);
    private readonly _sizeSubject: BehaviorSubject<number> = new BehaviorSubject(0);
    private readonly _currentPageIndexSubject: BehaviorSubject<number> = new BehaviorSubject(0);

    public readonly type: PlayableListType;
    public context: T;
    public readonly id: string;

    private readonly $destroy: Observable<void> = this._destroySubject.asObservable();

    /**
     * Observable that emits the state of loading. Loading means in this context: Loading the complete list of ids
     * contained in that list. For actually getting the state of loading metadata, use $isFetching.
     */
    public readonly $isReady: Observable<boolean> = this._readySubject.asObservable().pipe(takeUntil(this.$destroy));

    /**
     * Observable that emits the state of ongoing fetches. This means, true is emitted every time any kind of metadata
     * is fetched from the backend.
     */
    public readonly $isFetching: Observable<boolean> = this._fetchingStateSubject.asObservable().pipe(takeUntil(this.$destroy));

    public readonly $error: Observable<Error> = this._errorSubject.asObservable().pipe(takeUntil(this.$destroy));
    public readonly $totalElements: Observable<number> = this._totalElementsSubject.asObservable().pipe(takeUntil(this.$destroy));
    public readonly $size: Observable<number> = this._sizeSubject.asObservable().pipe(takeUntil(this.$destroy));
    public readonly $currentPageIndex: Observable<number> = this._currentPageIndexSubject.asObservable().pipe(takeUntil(this.$destroy));

    private readonly resource: SCResourceMapQueue<Song> = new SCResourceMapQueue();
    private readonly dataSourceList: SCResourceList<Song> = new SCResourceList();

    /**
     * Observable that emits new values every time the user loads more content via infinite scroll.
     * This observable is suitable for displaying the playlists tracks in a list.
     */
    public readonly $dataSource: Observable<Song[]> = this.dataSourceList.$items.pipe(takeUntil(this.$destroy)); // this.resource.$map.pipe(takeUntil(this.$destroy), map((map) => Object.values(map))) // this._dataSourceSubject.asObservable().pipe(takeUntil(this.$destroy));

    /**
     * Observable that emits new values every time the internal queue is updated. This is just a filter of the $dataSource Observable
     * and filters out the songs, that are not enqueued anymore. The purpose of this observable is displaying remaining items
     * of an enqueued playable list.
     */
    public readonly $queue: Observable<Song[]> = combineLatest([
        this.resource.$queue,
        this.$dataSource
        
    ]).pipe(takeUntil(this.$destroy), map(([queue, songs]) => songs.filter((song) => {
        return this.resource.isEnqueued(song.id);
    })));


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
        return this.resource.items();
    }

    /**
     * Get the current amount of queued songs
     * of the playable list.
     */
    public get queueSize(): number {
        return this.resource.size();
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
        // Check if the list is already fetching some content.
        // To prevent conflicts, do not continue if already fetching.
        const isFetching = this._fetchingStateSubject.getValue();
        if(isFetching) return;

        // Update fetching state
        this._fetchingStateSubject.next(true);

        // Send the fetch request.
        firstValueFrom(this._httpClient.get<Page<Song>>(this._metadataUrl+Pageable.toQuery({ page: this._currentPageIndex, size: PLAYLIST_BATCH_SIZE }))).then((page) => {
            // Update totalElements count
            this._totalElements = page.totalElements;
            this._totalElementsSubject.next(page.totalElements);
            
            if(page.elements.length > 0) {
                this._sizeSubject.next(this._sizeSubject.getValue() + page.elements.length)
                // Update page index
                this._currentPageIndex++;
                this._currentPageIndexSubject.next(this._currentPageIndex);

                const length = page.elements.length;
                let i = 0;

                while (i < length) {
                    const song = page.elements[i];
                    song.listContext = this;
                    if(song) {
                        this.resource.set(song);
                        this.dataSourceList.add(song);
                    }
                    i++;
                }
            }
        }).catch((error: Error) => {
            // Emit error
            this._errorSubject.next(error);
        }).finally(() => {
            // Set loading back to false
            this._fetchingStateSubject.next(false);

        })
    }

    /**
     * Retrieve complete list of songs for a playable list.
     * This functions makes use of the "listUrl" property.
     * NOTE: Song objects retrieved via the "listURL" only contain
     * valid ids, no other properties are populated.
     */
    private async fetchSongsList() {
        this._readySubject.next(false);

        // Retrieve complete songs list (only contains song ids)
        firstValueFrom(this._httpClient.get<Page<Song>>(this._listUrl)).then((page) => {
            this._totalElements = page.totalElements;
            const length = page.elements.length;

            let i = 0;
            while (i < length) {
                const song = page.elements[i];
                if(song) this.resource.enqueue(song);
                i++;
            }

            // Fetch first page
            this.fetchNextPage().catch((error) => {
                this._errorSubject.next(error);
            })

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
     * This returns a promise, because it may happen that the 
     * song's metadata needs to be fetched. The promise resolves as soon
     * as the metadata is available.
     * @returns Promise<Song>
     */
    public async emitNextSong(random: boolean = false): Promise<Song> {
        // Next song exists, delete from queue and resources
        const nextSong = await this.resource.dequeue(random);
        if(!nextSong) return null

        // If metadata already fetched, return it
        const metadata = this.resource.get(nextSong.id);
        if(metadata && metadata.title) return metadata;
                
        // Otherwise fetch and return it afterwards
        // Also add it to the dataset, so the playlist doesn't have to fetch this song again (except if its in batch request)
        return this.fetchSongMetadata(nextSong.id);
    }

    /**
     * Emits a song by a specific id.
     * This returns a promise, because it may happen that the 
     * song's metadata needs to be fetched. The promise resolves as soon
     * as the metadata is available.
     * @param songId Song's id
     * @returns Promise<Song>
     */
    public async emitId(songId: string): Promise<Song> {
        const nextSong = await this.resource.dequeueId(songId);
        if(!nextSong) return null

        const metadata = this.resource.get(nextSong.id);
        if(metadata) return metadata;

        return this.fetchSongMetadata(songId);
    }

    public async addSong(song: Song) {
        this.resource.set(song);
        this.resource.enqueue(song);
    }

    public async addSongBulk(songs: Song[]) {
        for(const song of songs) {
            await this.addSong(song);
        }
    }

    public async removeSong(song: Song) {
        this.resource.remove(song.id);
        this._totalElements--;
        this._totalElementsSubject.next(this._totalElements);
    }

    public async removeSongBulk(songs: Song[]) {
        for(const song of songs) {
            await this.removeSong(song);
        }
    }

    private async fetchSongMetadata(songId: string): Promise<Song> {
        return firstValueFrom(this._httpClient.get<Song>(`${environment.api_base_uri}/v1/songs/${songId}`).pipe(takeUntil(this.$destroy))).then((song) => {
            this.resource.set(song);
            return song;
        }).catch((error: Error) => {
            this._errorSubject.next(error)
            return null;
        })
    }



    public async updateSong(song: Song) {
        this.resource.set(song);
    }

}