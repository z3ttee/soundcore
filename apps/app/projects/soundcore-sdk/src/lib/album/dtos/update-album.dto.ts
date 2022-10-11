import { Artist } from "../../artist/entities/artist.entity";

export class UpdateAlbumDTO {

    /**
     * REQUIRED Name of the album
     * At least 3 and at most 120 characters
     */
    public name: string;

    /**
     * OPTIONAL Specify if the backend should lookup the album
     * on genius.com after it has been successfully created.
     */
    public lookupGenius?: boolean;

    /**
     * OPTIONAL Set a primary artist
     */
    public primaryArtist?: Artist;

    /**
     * OPTIONAL Set a release date. This is just for for 
     * showing users when the album has been released.
     */
    public releasedAt?: Date;

    /**
     * OPTIONAL Set a description. Usually this is overwritten when looking
     * up the album on genius.com. This field is used to give users a short
     * description on the album.
     * 
     * If set, must be at least 3 and at most 4000 characters
     */
    public description?: string;
}