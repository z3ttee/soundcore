import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
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
  private _songsSubject: BehaviorSubject<Song[]> = new BehaviorSubject([]);

  public playlist: Playlist = null;
  public $songs: Observable<Song[]> = this._songsSubject.asObservable();

  // Pagination
  private currentPage: number = 0;

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
          this.findSongs();
        }
      }).finally(() => this.isLoading = false);
    })
  }

  public async findSongs() {
    this.playlistService.findSongsByPlaylist(this.playlist.id, { page: this.currentPage, size: 50 }).then((page) => {
      if(page.elements.length > 0) this.currentPage++;
      this._songsSubject.next([
        ...this._songsSubject.getValue(),
        ...page.elements
      ])
    });
  }

}
