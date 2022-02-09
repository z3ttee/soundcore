import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AscPlaylistContextMenuComponent } from './playlist-context-menu.component';
import { MatButtonModule } from '@angular/material/button';
import { AscContextMenuTemplateModule } from '../context-menu-template/context-menu-template.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AscImageModule } from '../../image-components/image-components.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AscPlaylistContextMenuComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,

    AscImageModule,
    AscContextMenuTemplateModule,
  ],
  exports: [
    AscPlaylistContextMenuComponent
  ]
})
export class AscPlaylistContextMenuModule { }
