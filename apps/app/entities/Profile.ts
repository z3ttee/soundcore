import { Artwork } from "./Artwork";

export class Profile {

    public id!: string;
    public slug!: string;
    public name!: string;
    public accentColor?: string;

    public artwork?: Artwork;

    public createdAt?: Date;
    public updatedAt?: Date;

    public friendsCount? = 0;
    public playlistCount? = 0;

}