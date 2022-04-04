import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Playlist } from "soundcore-sdk";
import { Album } from "src/app/features/album/entities/album.entity";
import { Artist } from "src/app/features/artist/entities/artist.entity";
import { Collection } from "src/app/features/collection/entities/collection.entity";
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

    public static artistsTop(id: string): EndpointEntry {
        return {
            listUrl: `${environment.api_base_uri}/v1/songs/byArtist/${id}/top/ids`,
            metadataUrl: `${environment.api_base_uri}/v1/songs/byArtist/${id}/top`
        }
    }

    public static artists(id: string): EndpointEntry {
        return {
            listUrl: `${environment.api_base_uri}/v1/songs/byArtist/${id}/ids`,
            metadataUrl: `${environment.api_base_uri}/v1/songs/byArtist/${id}`
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

    public forArtist(context: Artist): PlayableList<Artist> {
        if(!context) return null;
        const urls = URLRegistry.artists(context.id)
        return this.forExistingId("artist", context.id) || new PlayableList<Artist>("artist", this.httpClient, urls.listUrl, urls.metadataUrl, context);
    }

    public forTopArtistSongs(context: Artist): PlayableList<Artist> {
        if(!context) return null;
        const urls = URLRegistry.artistsTop(context.id)
        console.log(this.forExistingId("topSongs", context.id))
        return this.forExistingId("topSongs", context.id) || new PlayableList<Artist>("topSongs", this.httpClient, urls.listUrl, urls.metadataUrl, context);
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

}