import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AscPlaylistContextMenuComponent } from './playlist-context-menu.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AscPlaylistContextMenuComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule
  ],
  exports: [
    AscPlaylistContextMenuComponent
  ]
})
export class AscPlaylistContextMenuModule { }
