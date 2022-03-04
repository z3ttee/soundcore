import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Playlist } from "src/app/features/playlist/entities/playlist.entity";
import { environment } from "src/environments/environment";
import { PlayableList } from "./playable-list.entity";

@Injectable({
    providedIn: "root"
})
export class ListCreator {

    constructor(private httpClient: HttpClient) {}

    public forPlaylist(context: Playlist) {
        return new PlayableList<Playlist>("playlist", this.httpClient, `${environment.api_base_uri}/v1/songs/byPlaylist/${context.id}/ids`, `${environment.api_base_uri}/v1/songs/byPlaylist/${context.id}`, context);
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