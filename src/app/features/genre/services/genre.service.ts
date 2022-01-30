import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Genre } from "src/app/model/genre.entity";
import { Page } from "src/app/pagination/pagination";
import { environment } from "src/environments/environment";
import { Album } from "../../album/entities/album.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";

@Injectable({
    providedIn: "root"
})
export class GenreService {

    constructor(private httpClient: HttpClient) {}

    public async findGenreById(genreId: string): Promise<Genre> {
        return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/genres/${genreId}`)) as Promise<Genre>
    }

    public async findPlaylistsByGenre(genreId: string): Promise<Page<Playlist>> {
        if(!genreId) return Page.of([]);
        return firstValueFrom(this.httpClient.get<Page<Playlist>>(`${environment.api_base_uri}/v1/playlists/byGenre/${genreId}`))
    }

    public async findAlbumByGenre(genreId: string): Promise<Page<Album>> {
        if(!genreId) return Page.of([]);
        return firstValueFrom(this.httpClient.get<Page<Album>>(`${environment.api_base_uri}/v1/albums/byGenre/${genreId}`))
    }

}