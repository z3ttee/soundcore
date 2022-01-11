import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Genre } from "src/app/model/genre.entity";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root"
})
export class GenreService {

    constructor(private httpClient: HttpClient) {}

    public async findGenreById(genreId: string): Promise<Genre> {
        return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/genres/${genreId}`)) as Promise<Genre>
    }

}