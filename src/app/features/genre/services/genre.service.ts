import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Playlist } from "soundcore-sdk";
import { Genre } from "src/app/model/genre.entity";
import { Page, Pageable } from "src/app/pagination/pagination";
import { environment } from "src/environments/environment";
import { Album } from "../../album/entities/album.entity";

@Injectable({
    providedIn: "root"
})
export class GenreService {

    constructor(private httpClient: HttpClient) {}

    public async findGenreById(genreId: string): Promise<Genre> {
        return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/genres/${genreId}`)) as Promise<Genre>
    }

    public async findGenresByArtist(artistId: string, pageable: Pageable): Promise<Page<Genre>> {
        if(!artistId) return Page.of([])
        return firstValueFrom(this.httpClient.get<Page<Genre>>(`${environment.api_base_uri}/v1/genres/byArtist/${artistId}${Pageable.toQuery(pageable)}`))
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