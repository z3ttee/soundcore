import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root"
})
export class LikeService {

    constructor(
        private httpClient: HttpClient
    ) {}

    public async likeSong(songId: string): Promise<void> {
        if(!songId) return null;
        return firstValueFrom(this.httpClient.post<void>(`${environment.api_base_uri}/v1/likes/song/${songId}`, {}))
    }

}