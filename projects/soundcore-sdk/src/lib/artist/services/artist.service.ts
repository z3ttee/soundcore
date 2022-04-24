import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Artist } from "../entities/artist.entity";

@Injectable()
export class SCDKArtistService {

  constructor(
    private httpClient: HttpClient,
    @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
  ) { }

  /**
   * Find an artist by its id.
   * @param artistId Artist's id
   * @returns Observable<Artist>
   */
  public findById(artistId: string): Observable<Artist> {
    if(!artistId) return of(null);
    return this.httpClient.get<Artist>(`${this.options.api_base_uri}/v1/artists/${artistId}`)
  }

}
