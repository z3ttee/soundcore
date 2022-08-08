import { ArtworkType } from "../entities/artwork.entity";

export class CreateArtworkDTO {

    public name: string;
    public type: ArtworkType = ArtworkType.SONG;
    public fromSource: string | Buffer;

}