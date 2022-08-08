import { GeniusRelationType } from "../enums/genius-relation-type.enum";
import { GeniusType } from "../enums/genius-type.enum";
import { GeniusSongDTO } from "./genius-song.dto";

export class GeniusRelationshipDTO {

    public _type: GeniusType;
    public relationship_type: GeniusRelationType;
    public type: GeniusRelationType;
    public songs: GeniusSongDTO[];

}