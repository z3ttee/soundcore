import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Observable } from 'rxjs';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { PlaylistService } from 'src/app/features/playlist/services/playlist.service';
import { AuthenticationService } from 'src/sso/services/authentication.service';

@Component({
  selector: 'asc-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public $playlists: Observable<Playlist[]> = this.playlistService.$playlists;

  public error: HttpErrorResponse = undefined;

  constructor(
    private playlistService: PlaylistService,
    public authService: AuthenticationService
  ) { }

  public async ngOnInit(): Promise<void> {
    this.authService.$user.subscribe((user) => console.log(user.roles))
  }

  public async openCreatePlaylist() {
    this.playlistService.openEditorDialog({ mode: "create" })
  }

}
