import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { first, firstValueFrom, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Song } from "../model/song.model";
import { Page } from "../pagination/pagination";
import { AuthenticationService } from "./authentication.service";

@Injectable({
    providedIn: 'root'
})
export class SongService {

    constructor(
        private httpClient: HttpClient,
        private authService: AuthenticationService
    ) {}

    public findLatestSongs(): Observable<Page<Song>> {
        // TODO: Remove header from request and make centralized
        return this.httpClient.get(`${environment.api_base_uri}/v1/songs/latest`, { headers: { "Authorization": `Bearer ${this.authService.getAccessToken()}` } }) as Observable<Page<Song>>
    }

}