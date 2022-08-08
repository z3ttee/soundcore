import { Playlist } from "../../playlist/entities/playlist.entity";
import { User } from "../../user/entities/user.entity";

export class SpotifyClientAccessToken {
    public access_token: string;
    public token_type: string;
    public expires_in: number;
}

export class SpotifyImage {
    public url: string;
    public height: number;
    public width: number;
}

export class SpotifyTrackItem {
    public added_at: Date;
    public track: SpotifySong
}

export class SpotifyTrackList {
    public items: SpotifyTrackItem[];
    public limit: number;
    public next: string;
    public offset: number;
    public previous: string;
    public total: number;
}

export class SpotifyPlaylist {
    public id: string;
    public name: string;
    public description: string;
    public images: SpotifyImage[];
    public tracks: SpotifyTrackList;
    public type: string;
    public uri: string;
    public href: string;
}

export class SpotifySong {
    public artists: { name: string }[];
    public album: { name: string };
    public name: string;
    public id: string;
}

export class SpotifyBullJob {
    public playlist: SpotifyPlaylist;
    public importer: User;
    public resultPlaylist?: Playlist
}