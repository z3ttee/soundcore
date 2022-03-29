import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueueViewComponent } from './views/queue-view/queue-view.component';
import { RouterModule, Routes } from '@angular/router';
import { AscSongListModule } from 'src/app/components/lists/song-list/song-list.module';
import { AscPlayableListModule } from 'src/app/components/lists/playable-list/playable-list.module';
import { AscMessageModule } from 'src/app/components/message-components/message-components.module';

const routes: Routes = [
  { path: "", component: QueueViewComponent }
]

@NgModule({
  declarations: [
    QueueViewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    AscSongListModule,
    AscPlayableListModule,
    AscMessageModule
  ]
})
export class QueueModule { }
