import { Album } from "../album/entities/album.entity";

export class AlbumChangedEvent {

    constructor(
        public readonly target: Album
    ) {}

}