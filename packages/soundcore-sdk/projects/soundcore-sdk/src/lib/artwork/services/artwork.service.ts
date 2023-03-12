import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { SCDK_OPTIONS } from "../../constants";
import { SCDKOptions } from "../../scdk.module";
import { Artwork } from "../entities/artwork.entity";

@Injectable()
export class SCDKArtworkService {

    constructor(
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
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