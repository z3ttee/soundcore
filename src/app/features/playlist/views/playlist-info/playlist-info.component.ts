import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Song } from 'src/app/features/song/entities/song.entity';
import { Playlist } from '../../entities/playlist.entity';
import { PlaylistService } from '../../services/playlist.service';

@Component({
  templateUrl: './playlist-info.component.html',
  styleUrls: ['./playlist-info.component.scss']
})
export class PlaylistInfoComponent implements OnInit {

  // Loading states
  public isLoading: boolean = false;
  public isAuthorLoading: boolean = false;

  // Data providers
  public playlist: Playlist = null;
  public songs: Song[] = []

  // Accent colors  
  public accentColor: string = "#FFBF50";

  constructor(
    private activatedRoute: ActivatedRoute,
    private playlistService: PlaylistService
  ) { }

  public async ngOnInit(): Promise<void> {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      const playlistId: string = paramMap.get("playlistId");

      this.isLoading = true;
      this.playlistService.findById(playlistId).then((playlist) => {
        this.playlist = playlist;
        console.log(playlist)

        if(this.playlist) {
          this.playlistService.findSongsByPlaylist(this.playlist.id).then((page) => {
            this.songs = page.elements;
            console.log(this.songs)
          });
        }
      }).finally(() => this.isLoading = false);
    })
    

  }

}
