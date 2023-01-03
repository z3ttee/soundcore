import { CreateArtistDTO } from "../../artist/dtos/create-artist.dto";

export class ID3TagsDTO {

    public filepath: string;
    public title: string;
    public duration: number;
    public artists: CreateArtistDTO[];
    public album: string;
    public cover: Buffer;
    public orderNr: number;

}