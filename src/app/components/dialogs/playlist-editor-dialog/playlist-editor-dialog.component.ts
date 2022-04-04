import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { SCDKPlaylistService } from 'soundcore-sdk';
import { PlaylistPrivacy } from 'src/app/features/playlist/types/playlist-privacy.types';
import { AscPlaylistEditorOptions } from './dto/playlist-editor-options.dto';

@Component({
  templateUrl: './playlist-editor-dialog.component.html',
  styleUrls: ['./playlist-editor-dialog.component.scss']
})
export class AscPlaylistEditorDialogComponent implements OnInit {

  constructor(
    private playlistService: SCDKPlaylistService,
    private dialog: MatDialogRef<AscPlaylistEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public options: AscPlaylistEditorOptions = new AscPlaylistEditorOptions()
  ) { }

  // Loading states
  public isLoading: boolean = false;

  // Error states
  public error: HttpErrorResponse = undefined;

  // Form handling
  public playlistDto: FormGroup = new FormGroup({
    title: new FormControl(this.options?.contextData?.title, [ Validators.required, Validators.minLength(3), Validators.maxLength(120) ]),
    privacy: new FormControl(this.options?.contextData?.privacy || "public")
  })

  // Provide list items for select-input
  public availablePrivacyOptions: {value: PlaylistPrivacy, name: string}[] = [ 
    { name: "Öffentlich", value: "public" },
    { name: "Nicht gelistet", value: "not_listed" },
    { name: "Privat", value: "private" },
  ]

  public ngOnInit(): void {}

  public async save() {
    this.error = undefined;
    this.isLoading = true;

    if(this.options.mode == "create") {
      // Create playlist
      firstValueFrom(this.playlistService.createPlaylist(this.playlistDto.value)).then((playlist) => {
        this.dialog.close(playlist);
      }).catch((reason: HttpErrorResponse) => {
        this.error = reason;
      }).finally(() => this.isLoading = false)
    } else {
      // Update playlist
      firstValueFrom(this.playlistService.updatePlaylist(this.options.contextData?.id, { 
        title: this.playlistDto.get("title").value, 
        privacy: this.playlistDto.get("privacy").value 
      })).then(() => {
        this.options.contextData.title = this.playlistDto.get("title").value || this.options.contextData.title
        this.options.contextData.privacy = this.playlistDto.get("privacy").value || this.options.contextData.privacy;
        this.dialog.close(this.options.contextData)
      }).catch((reason: HttpErrorResponse) => {
        this.error = reason;
      }).finally(() => this.isLoading = false)
    }

    
  }

  public async cancel() {
    this.dialog.close(null)
  }

}
