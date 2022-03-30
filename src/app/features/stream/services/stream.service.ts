import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "src/environments/environment";
import { Song } from "../../song/entities/song.entity";
import { StreamToken } from "../entities/stream-token.entity";

@Injectable()
export class StreamService {

    constructor(
        private httpClient: HttpClient
    ) {}

    public async getStreamURL(token: StreamToken) {
        if(!token) return "";
        return `${environment.api_base_uri}/v1/streams/songs?token=${token.token}`;
    }

    public async getTokenForSong(song: Song): Promise<StreamToken> {
        if(!song) return null;
        return firstValueFrom(this.httpClient.get<StreamToken>(`${environment.api_base_uri}/v1/streams/token/${song.id}`));
    }

}