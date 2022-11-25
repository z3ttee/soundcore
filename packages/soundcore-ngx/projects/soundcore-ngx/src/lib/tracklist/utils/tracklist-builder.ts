import { Injectable } from "@angular/core";
import { Album, Artist, Playlist, SCSDKTracklistService, TracklistType } from "@soundcore/sdk";
import { SCNGXTracklist } from "../entities/tracklist.entity";

@Injectable({
    providedIn: "root"
})
export class SCNGXTracklistBuilder {

    constructor(
        private readonly service: SCSDKTracklistService
    ) {}

    public static useService(service: SCSDKTracklistService): SCNGXTracklistBuilder {
        return new SCNGXTracklistBuilder(service);
    }

    public forPlaylist(playlist: Playlist, pageSize?: number): SCNGXTracklist {
        if(typeof playlist === "undefined" || playlist == null) return null;
        return new SCNGXTracklist(TracklistType.PLAYLIST, playlist?.id, this.service, playlist, pageSize);
    }

    public forAlbum(album: Album, pageSize?: number): SCNGXTracklist {
        if(typeof album === "undefined" || album == null) return null;
        return new SCNGXTracklist(TracklistType.ALBUM, album?.id, this.service, album, pageSize);
    }

    public forArtist(artist: Artist, pageSize?: number): SCNGXTracklist {
        if(typeof artist === "undefined" || artist == null) return null;
        return new SCNGXTracklist(TracklistType.ARTIST, artist?.id, this.service, artist, pageSize);
    }

    public forArtistTop(artist: Artist, pageSize?: number): SCNGXTracklist {
        if(typeof artist === "undefined" || artist == null) return null;
        return new SCNGXTracklist(TracklistType.ARTIST_TOP, artist?.id, this.service, artist, pageSize);
    }

}