import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { ComplexSearchResult } from "../entities/search-result.model";

@Injectable({
  providedIn: "root"
})
export class SCDKSearchService {

  constructor(
    private httpClient: HttpClient,
    @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
  ) { }

  public performComplexSearch(query: string): Observable<ComplexSearchResult> {
    return this.httpClient.get<ComplexSearchResult>(`${this.options.api_base_uri}/v1/search/?q=${query.toLowerCase()}`);
  }
}
