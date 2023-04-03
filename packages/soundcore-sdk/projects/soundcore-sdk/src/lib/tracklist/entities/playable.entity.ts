
export enum PlayableEntityType {
    SONG = "song",
    ALBUM = "album",
    ARTIST = "artist",
    PLAYLIST = "playlist"
}

export interface PlayableEntity {
    readonly id: string;
    readonly type: PlayableEntityType;
}