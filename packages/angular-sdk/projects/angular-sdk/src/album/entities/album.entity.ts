import { Artist } from "../../artist/entities/artist.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { Label } from "../../label/entities/label.entity";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { PlayableEntity, PlayableEntityType } from "../../tracklist/entities/playable.entity";

export class Album implements PlayableEntity {
    public type: PlayableEntityType;

    public id: string;
    public slug: string;
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