
export enum PlayableEntityType {
    SONG = "song",
    ALBUM = "album",
    ARTIST = "artist",
    ARTIST_TOP = "artist_top",
    PLAYLIST = "playlist",
    FAVOURITES = "favourites"
}

export interface PlayableEntity {
    readonly id: string;
    readonly type: PlayableEntityType;
    name: string;
}