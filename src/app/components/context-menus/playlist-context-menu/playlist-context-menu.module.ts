import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AscPlaylistContextMenuComponent } from './playlist-context-menu.component';
import { MatButtonModule } from '@angular/material/button';
import { AscContextMenuTemplateModule } from '../context-menu-template/context-menu-template.module';

@NgModule({
  declarations: [
    AscPlaylistContextMenuComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,

    AscContextMenuTemplateModule
  ],
  exports: [
    AscPlaylistContextMenuComponent
  ]
})
export class AscPlaylistContextMenuModule { }
