import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { PlaylistService } from '../../services/playlist.service';
import { PlaylistPrivacy } from '../../types/playlist-privacy.types';

@Component({
  selector: 'asc-create-playlist',
  templateUrl: './create-playlist.component.html',
  styleUrls: ['./create-playlist.component.scss']
})
export class CreatePlaylistDialog implements OnInit {

  public playlistDto: FormGroup = new FormGroup({
    title: new FormControl("", [ Validators.required, Validators.minLength(3), Validators.maxLength(120) ]),
    description: new FormControl("", [ Validators.minLength(3), Validators.maxLength(4000) ]),
    privacy: new FormControl("public" as PlaylistPrivacy)
  })

  public isLoading: boolean = false;
  public error: HttpErrorResponse = undefined;

  public availablePrivacyOptions: {value: PlaylistPrivacy, name: string}[] = [ 
    { name: "Öffentlich", value: "public" },
    { name: "Nicht gelistet", value: "not_listed" },
    { name: "Privat", value: "private" },
  ]

  constructor(
    private playlistService: PlaylistService,
    private dialog: MatDialogRef<CreatePlaylistDialog>
  ) { }

  ngOnInit(): void {
  }

  public async save() {
    this.error = undefined;
    this.isLoading = true;

    this.playlistService.create(this.playlistDto.value).then((playlist) => {
      this.dialog.close(playlist);
    }).catch((reason: HttpErrorResponse) => {
      this.error = reason;
    }).finally(() => this.isLoading = false)
  }

  public async cancel() {
    this.dialog.close(null)
  }

}
