import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamPlayerBarComponent } from './components/stream-player-bar/stream-player-bar.component';

import { AppCommonModule } from "../../common.module"
import { SeekerComponent } from 'src/app/components/seeker/seeker.component';
import { RouterModule, Routes } from '@angular/router';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { StreamService } from './services/stream.service';
import { StreamQueueService } from './services/queue.service';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = []

@NgModule({
  declarations: [
    StreamPlayerBarComponent,
    SeekerComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    PipesModule,
    RouterModule.forChild(routes),

    MatButtonModule
  ],
  exports: [
    StreamPlayerBarComponent
  ],
  providers: [
    StreamService,
    StreamQueueService
  ]
})
export class StreamModule { }
