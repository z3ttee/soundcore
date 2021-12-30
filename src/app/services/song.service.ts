import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Song } from "../model/song.model";
import { Page } from "../pagination/pagination";

@Injectable({
    providedIn: 'root'
})
export class SongService {

    constructor(
        private httpClient: HttpClient
    ) {}

    public findLatestSongs(): Observable<Page<Song>> {
        return this.httpClient.get(`${environment.api_base_uri}/v1/songs/latest`) as Observable<Page<Song>>
    }

}