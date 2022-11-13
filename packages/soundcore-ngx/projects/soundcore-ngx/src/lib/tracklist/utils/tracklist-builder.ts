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

    public forPlaylist(playlist: Playlist): SCNGXTracklist {
        return new SCNGXTracklist(TracklistType.PLAYLIST, playlist.id, this.service, playlist);
    }

    public forAlbum(album: Album): SCNGXTracklist {
        return new SCNGXTracklist(TracklistType.ALBUM, album.id, this.service, album);
    }

    public forArtist(artist: Artist): SCNGXTracklist {
        return new SCNGXTracklist(TracklistType.ARTIST, artist.id, this.service, artist);
    }

    public forArtistTop(artist: Artist): SCNGXTracklist {
        return new SCNGXTracklist(TracklistType.ARTIST_TOP, artist.id, this.service, artist);
    }

}