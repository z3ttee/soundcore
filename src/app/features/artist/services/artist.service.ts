import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Artist } from 'src/app/model/artist.model';
import { environment } from 'src/environments/environment';
import { Song } from '../../song/entities/song.entity';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {

  constructor(private httpClient: HttpClient) { }

  public async findProfileById(artistId: string): Promise<Artist> {
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/artists/${artistId}`)) as Promise<Artist>
  }

  public async findTopSongsByArtist(artistId: string): Promise<Song[]> {
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/songs/byArtist/${artistId}/top`)) as Promise<Song[]>
  }

}
