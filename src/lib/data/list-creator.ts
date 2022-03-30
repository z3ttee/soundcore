import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Album } from "src/app/features/album/entities/album.entity";
import { Collection } from "src/app/features/collection/entities/collection.entity";
import { Playlist } from "src/app/features/playlist/entities/playlist.entity";
import { QueueList } from "src/app/features/stream/entities/queue-item.entity";
import { StreamQueueService } from "src/app/features/stream/services/queue.service";
import { environment } from "src/environments/environment";
import { PlayableList, PlayableListType } from "./playable-list.entity";

export type EndpointEntry = { listUrl: string, metadataUrl: string }
export class URLRegistry {

    public static playlists(id: string): EndpointEntry {
        return {
            listUrl: `${environment.api_base_uri}/v1/songs/byPlaylist/${id}/ids`,
            metadataUrl: `${environment.api_base_uri}/v1/songs/byPlaylist/${id}`
        }
    }

    public static albums(id: string): EndpointEntry {
        return {
            listUrl: `${environment.api_base_uri}/v1/songs/byAlbum/${id}/ids`,
            metadataUrl: `${environment.api_base_uri}/v1/songs/byAlbum/${id}`
        }
    }

    public static collections(): EndpointEntry {
        return {
            listUrl: `${environment.api_base_uri}/v1/songs/byCollection/ids`,
            metadataUrl: `${environment.api_base_uri}/v1/songs/byCollection`
        }
    }

}

@Injectable({
    providedIn: "root"
})
export class ListCreator {

    constructor(
        private queueService: StreamQueueService,
        private httpClient: HttpClient
    ) {}

    public forPlaylist(context: Playlist): PlayableList<Playlist> {
        if(!context) return null;
        const urls = URLRegistry.playlists(context.id)
        return this.forExistingId("playlist", context.id) || new PlayableList<Playlist>("playlist", this.httpClient, urls.listUrl, urls.metadataUrl, context);
    }

    public forAlbum(context: Album): PlayableList<Album> {
        if(!context) return null;
        const urls = URLRegistry.albums(context.id)
        return this.forExistingId("album", context.id) || new PlayableList<Album>("album", this.httpClient, urls.listUrl, urls.metadataUrl, context);
    }

    public forCollection(context: Collection, userId: string): PlayableList<Collection> {
        if(!context) return null;
        context.id = userId;
        const urls = URLRegistry.collections()
        return this.forExistingId("collection", context.id) || new PlayableList<Collection>("collection", this.httpClient, urls.listUrl, urls.metadataUrl, context);
    }

    /**
     * Check if playable list already exists in queue.
     * If so, this means the list has been fetched already
     * and can be reused (some kind of caching)
     * @param id 
     * @returns 
     */
    private forExistingId<T>(type: PlayableListType, id: string): PlayableList<T> {
        const key = PlayableList.buildId(type, id)

        if(this.queueService.hasKey(key)) {
            const item = this.queueService.get(key);
            if(!item.isList) return null;
            return (item as QueueList).item;
        }

        return null;
    }

    /*public forArtist(context: Artist) {
        const list = new PlayableList<Artist>("artist", this.httpClient, `${environment.api_base_uri}/v1/artist/${context.id}/songs`, `${environment.api_base_uri}/v1/songs/byArtist/${context.id}/top`, context);
        return list;
    }*/



    /*public static forCollection(startSongIndex: number = 0, contextData?: Collection) {
        const list = new PlayableList<Collection>("@me", "collection", startSongIndex, contextData);
        return list;
    }

    public static forPlaylist(resourceId: string, startSongIndex: number = 0, contextData?: Playlist) {
        const list = new PlayableList<Playlist>(resourceId, "playlist", startSongIndex, contextData);
        return list;
    }

    public static forAlbum(resourceId: string, startSongIndex: number = 0, contextData?: Album) {
        const list = new PlayableList<Album>(resourceId, "album", startSongIndex, contextData);
        return list;
    }

    public static forRandom(resourceId: string, contextData?: any) {
        const list = new PlayableList<any>(resourceId, "random", 0, contextData);
        return list;
    }*/

}