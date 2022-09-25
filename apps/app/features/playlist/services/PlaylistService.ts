import { Page } from "nestjs-pager";
import { Playlist } from "../entities/Playlist";

export class PlaylistService {

    constructor(private readonly _accessToken: string) {}

    public static withToken(accessToken: string) {
        return new PlaylistService(accessToken);
    }

    public async findPlaylistsByCurrentUser(): Promise<Page<Playlist>> {
        return fetch(`${process.env.API_BASE}/v1/playlists/@me`, {
            headers: {
                'Authorization': `Bearer ${this._accessToken}`
            }
        }).then((response) => {
            return response.json().then((result) => {
                return result;
            });
        }).catch((error) => {
            console.error(error.message);
            return null;
        })
    }

}