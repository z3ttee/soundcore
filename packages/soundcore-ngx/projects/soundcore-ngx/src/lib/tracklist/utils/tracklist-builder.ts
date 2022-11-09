import { Injectable } from "@angular/core";
import { SCSDKTracklistService, TracklistType } from "@soundcore/sdk";
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

    public forPlaylist(playlistId: string): SCNGXTracklist {
        return new SCNGXTracklist(TracklistType.PLAYLIST, playlistId, this.service);
    }

    public forAlbum(albumId: string): SCNGXTracklist {
        return new SCNGXTracklist(TracklistType.ALBUM, albumId, this.service);
    }

    public forArtist(artistId: string): SCNGXTracklist {
        return new SCNGXTracklist(TracklistType.ARTIST, artistId, this.service);
    }

    public forArtistTop(artistId: string): SCNGXTracklist {
        return new SCNGXTracklist(TracklistType.ARTIST_TOP, artistId, this.service);
    }

}