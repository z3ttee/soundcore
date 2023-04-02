
export enum PlayableEntityType {
    SONG = "song",
    ALBUM = "album",
    ARTIST = "artist"
}

export interface PlayableEntity {
    readonly id: string;
    readonly type: PlayableEntityType;
}