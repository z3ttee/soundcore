import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { User } from 'src/app/features/user/entities/user.entity';
import { environment } from 'src/environments/environment';
import { Playlist } from '../../entities/playlist.entity';
import { PlaylistService } from '../../services/playlist.service';

@Component({
  selector: 'asc-playlist-info',
  templateUrl: './playlist-info.component.html',
  styleUrls: ['./playlist-info.component.scss']
})
export class PlaylistInfoComponent implements OnInit {

  private _songSubject: BehaviorSubject<Song[]> = new BehaviorSubject([])

  public playlist: Playlist = null;
  public isLoading: boolean = false;

  public coverSrc: string = null;
  public accentColor: string = "";

  public isAuthorLoading: boolean = false;
  public author: User = null;

  public $songs: Observable<Song[]> = this._songSubject.asObservable();

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
            this._songSubject.next(page.elements)
          });
        }

        if(this.playlist?.artwork) {
            this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.playlist.artwork.id}`;
            this.accentColor = this.playlist.artwork.accentColor || "#000000";
        } else {
            this.coverSrc = "/assets/img/missing_cover.png"
        }
      }).finally(() => this.isLoading = false);
    })
    

  }

}
