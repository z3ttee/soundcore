import { Artwork, ArtworkType } from "../entities/artwork.entity";
import { ArtworkSourceType } from "./artwork-process.dto";

export class CreateArtworkDTO implements 
    Pick<Artwork, "id">,
    Pick<Artwork, "type">,
    Partial<Pick<Artwork, "sourceType">>,
    Partial<Pick<Artwork, "sourceUri">>
{
    public id: string;
    public type: ArtworkType;

    public sourceType?: ArtworkSourceType;
    public sourceUri?: string;

}