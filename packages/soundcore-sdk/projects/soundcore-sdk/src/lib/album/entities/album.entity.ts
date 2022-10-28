import { Artist } from "../../artist/entities/artist.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { Label } from "../../label/entities/label.entity";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { SCDKGeniusFlag, SCDKResource, SCDKResourceFlag, SCDKResourceType } from "../../utils/entities/resource";

export class Album implements SCDKResource {
    public resourceType: SCDKResourceType = "album";

    public id: string;
    public flag: SCDKResourceFlag;
    public geniusFlag: SCDKGeniusFlag;
    public slug: string;
    public geniusId: string;
    public name: string;
    public releasedAt: Date;
    public createdAt: Date;
    public description: string;

    public primaryArtist?: Artist;
    public artwork?: Artwork;

    public distributors?: Distributor[];
    public labels?: Label[];
    public publishers?: Publisher[];

    public songsCount?: number;
    public totalDuration?: number;
    public liked?: boolean;
}