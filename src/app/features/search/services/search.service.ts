import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ComplexSearchResult } from 'src/app/features/search/entities/search-result.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private httpClient: HttpClient) { }

  public async performComplexSearch(query: string): Promise<ComplexSearchResult> {
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/search/?q=${query.toLowerCase()}`)) as Promise<ComplexSearchResult>;
  }
}
