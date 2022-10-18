import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { Song } from "../../song/entities/song.entity";

export enum MeiliJobType {

    SYNC_SONGS = 0,
    SYNC_ALBUMS = 1,
    SYNC_ARTISTS = 2,
    SYNC_GENRES = 3,
    SYNC_PLAYLISTS = 4,
    SYNC_ALL

}

export type MeiliResource = Song | Album | Artist | Playlist;

export class MeiliJob {

    constructor(
        public readonly resources: MeiliResource[],
        public readonly type: MeiliJobType
    ) {}

}