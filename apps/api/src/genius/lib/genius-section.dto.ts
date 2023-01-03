import { GeniusType } from "../enums/genius-type.enum";
import { GeniusSearchHitDTO } from "./genius-search-hit.dto";

export class GeniusSectionDTO {

    public type: GeniusType;
    public hits: GeniusSearchHitDTO[];

}