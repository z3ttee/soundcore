import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/sso/services/authentication.service';
import { SCDKPlaylistService } from "soundcore-sdk"
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'asc-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public error: HttpErrorResponse = undefined;

  constructor(
    public playlistService: SCDKPlaylistService,
    private dialogService: DialogService,
    public authService: AuthenticationService
  ) { }

  public async ngOnInit(): Promise<void> {
    this.authService.$user.subscribe((user) => console.log(user.roles))
  }

  public async openCreatePlaylist() {
    this.dialogService.openPlaylistEditorDialog({ mode: "create" })
  }

}
