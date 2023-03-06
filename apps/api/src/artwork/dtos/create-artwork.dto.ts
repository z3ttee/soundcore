import { Artwork, ArtworkType, DownloadableArtwork } from "../entities/artwork.entity";

export class CreateArtworkDTO implements 
    Pick<Artwork, "id">,
    Partial<Pick<Artwork, "accentColor">>
{

    constructor(
        public id: string,
        public type: ArtworkType,
        public accentColor?: string
    ) {}

}

export class CreateArtistArtworkDTO extends CreateArtworkDTO {
    constructor(id: string, accentColor?: string) {
        super(id, ArtworkType.ARTIST, accentColor);
    }
}

export class CreateAlbumArtworkDTO extends CreateArtworkDTO {
    constructor(id: string, accentColor?: string) {
        super(id, ArtworkType.ALBUM, accentColor);
    }
}

export class CreateDownloadableArtworkDTO extends CreateArtworkDTO implements Pick<DownloadableArtwork, "srcUrl">, Pick<DownloadableArtwork, "dstType"> {
    constructor(
        id: string,
        public srcUrl: string,
        public dstType: ArtworkType,
        accentColor?: string
    ) {
        super(id, ArtworkType.DOWNLOADABLE, accentColor);
    }
}