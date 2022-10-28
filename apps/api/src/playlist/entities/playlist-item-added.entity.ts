
export enum PlaylistAddSongFailReason {
    DUPLICATE = 0,
    NOT_FOUND = 1,
    ERROR = 2
}

export class PlaylistItemAddResult {

    constructor(
        public targetSongId: string,
        public failed: boolean,
        public failReason?: PlaylistAddSongFailReason
    ) {}

}