import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
<<<<<<< HEAD
import { SCSDKOptions, SCSDK_OPTIONS } from "../../scdk.module";
=======
import { SCSDK_OPTIONS } from "../../constants";
import { SCSDKOptions } from "../../scdk.module";
>>>>>>> main
import { Artwork } from "../entities/artwork.entity";

@Injectable()
export class SCDKArtworkService {

    constructor(
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

    /**
     * Build the url of a given artwork.
     * @param artwork Artwork to build url for.
     * @returns Observable<string>
     */
    public buildArtworkURL(artwork: Artwork): Observable<string> {
        if(!artwork || !artwork.id) return of(null);
        return of(`${this.options.api_base_uri}/v1/artworks/${artwork.id}`);
    }

}