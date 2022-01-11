import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Page } from 'src/app/pagination/pagination';
import { environment } from 'src/environments/environment';
import { CreatePlaylistDTO } from '../dtos/create-playlist.dto';
import { Playlist } from '../entities/playlist.entity';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  constructor(private httpClient: HttpClient) { }

  public async findPageByAuthor(authorId: string = "@me"): Promise<Page<Playlist>> {
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/playlists/${authorId}`)) as Promise<Page<Playlist>>
  }

  public async create(createPlaylistDto: CreatePlaylistDTO): Promise<Playlist> {
    return firstValueFrom(this.httpClient.post(`${environment.api_base_uri}/v1/playlists`, createPlaylistDto)) as Promise<Playlist>
  }
}
