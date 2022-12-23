import { Injectable } from "@angular/core";
import { Album, Artist, LikedSong, Playlist, PlaylistItem, SCSDKTracklistService, Song, TracklistType } from "@soundcore/sdk";
import { SCNGXTracklist } from "../entities/tracklist.entity";

export const TRACKLIST_REGISTRY: Map<string, SCNGXTracklist> = new Map();

@Injectable()
export class SCNGXTracklistBuilder {

    constructor(
        private readonly service: SCSDKTracklistService
    ) {}

    public static useService(service: SCSDKTracklistService): SCNGXTracklistBuilder {
        return new SCNGXTracklistBuilder(service);
    }

    public forPlaylist(playlist: Playlist, pageSize?: number) {
        if(typeof playlist === "undefined" || playlist == null) return null;

        const tracklistId = SCNGXTracklist.buildId(playlist.id, TracklistType.PLAYLIST);
        if(TRACKLIST_REGISTRY.has(tracklistId)) return TRACKLIST_REGISTRY.get(tracklistId);

        return new SCNGXTracklist<PlaylistItem, Playlist>(this.service, TracklistType.PLAYLIST, playlist.id, playlist, pageSize);
    }

    public forAlbum(album: Album, pageSize?: number) {
        if(typeof album === "undefined" || album == null) return null;

        const tracklistId = SCNGXTracklist.buildId(album.id, TracklistType.ALBUM);
        if(TRACKLIST_REGISTRY.has(tracklistId)) return TRACKLIST_REGISTRY.get(tracklistId);

        return new SCNGXTracklist<Song, Album>(this.service, TracklistType.ALBUM, album.id, album, pageSize);
    }

    public forArtist(artist: Artist, pageSize?: number) {
        if(typeof artist === "undefined" || artist == null) return null;

        const tracklistId = SCNGXTracklist.buildId(artist.id, TracklistType.ARTIST);
        if(TRACKLIST_REGISTRY.has(tracklistId)) return TRACKLIST_REGISTRY.get(tracklistId);

        return new SCNGXTracklist<Song, Artist>(this.service, TracklistType.ARTIST, artist.id, artist, pageSize);
    }

    public forArtistTop(artist: Artist, pageSize?: number) {
        if(typeof artist === "undefined" || artist == null) return null;

        const tracklistId = SCNGXTracklist.buildId(artist.id, TracklistType.ARTIST_TOP);
        if(TRACKLIST_REGISTRY.has(tracklistId)) return TRACKLIST_REGISTRY.get(tracklistId);

        return new SCNGXTracklist<Song, Artist>(this.service, TracklistType.ARTIST_TOP, artist.id, artist, pageSize);
    }

    public forLikedSongs(currentUserId: string, pageSize?: number): SCNGXTracklist {
        if(typeof currentUserId === "undefined" || currentUserId == null) return null;

        const tracklistId = SCNGXTracklist.buildId(currentUserId, TracklistType.LIKED_SONGS);
        if(TRACKLIST_REGISTRY.has(tracklistId)) return TRACKLIST_REGISTRY.get(tracklistId);

        return new SCNGXTracklist<LikedSong, null>(this.service, TracklistType.LIKED_SONGS, currentUserId, null, pageSize);
    }

}