import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Artist } from 'src/app/features/artist/entities/artist.entity';
import { Genre } from 'src/app/model/genre.entity';
import { Page, Pageable } from 'src/app/pagination/pagination';
import { environment } from 'src/environments/environment';
import { Album } from '../../album/entities/album.entity';
import { Song } from '../../song/entities/song.entity';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {

  constructor(private httpClient: HttpClient) { }

  public async findProfileById(artistId: string): Promise<Artist> {
    if(!artistId) return null;
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/artists/${artistId}`)) as Promise<Artist>
  }

  public async findTopSongsByArtist(artistId: string): Promise<Page<Song>> {
    return firstValueFrom(this.httpClient.get<Page<Song>>(`${environment.api_base_uri}/v1/songs/byArtist/${artistId}/top`))
  }

  /*public async findGenresByArtist(artistId: string, pageable: Pageable): Promise<Page<Genre>> {
    if(!artistId) return Page.of([]);
    return firstValueFrom(this.httpClient.get<Page<Genre>>(`${environment.api_base_uri}/v1/genres/byArtist/${artistId}${Pageable.toQuery(pageable)}`))
  }*/

  public async findGenreById(genreId: string): Promise<Genre> {
    if(!genreId) null;
    return firstValueFrom(this.httpClient.get<Genre>(`${environment.api_base_uri}/v1/genres/${genreId}`))
  }

  public async findSongsByGenreAndArtist(genreId: string, artistId: string, pageable: Pageable): Promise<Page<Song>> {
    if(!genreId || !artistId) return Page.of([])
    return firstValueFrom(this.httpClient.get<Page<Song>>(`${environment.api_base_uri}/v1/songs/byGenre/${genreId}/byArtist/${artistId}${Pageable.toQuery(pageable)}`));
  }

  public async findSongsByCollectionAndArtist(artistId: string, pageable: Pageable): Promise<Page<Song>> {
    if(!artistId) return Page.of([])
    return firstValueFrom(this.httpClient.get<Page<Song>>(`${environment.api_base_uri}/v1/songs/byCollection/byArtist/${artistId}${Pageable.toQuery(pageable)}`))
  }


}
