import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamPlayerBarComponent } from './components/stream-player-bar/stream-player-bar.component';

import { AppCommonModule } from "../../common.module"
import { RouterModule, Routes } from '@angular/router';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { StreamService } from './services/stream.service';
import { StreamQueueService } from './services/queue.service';
import { MatButtonModule } from '@angular/material/button';
import { AscInputModule } from 'src/app/components/input-components/input-components.module';
import { AscImageModule } from 'src/app/components/image-components/image-components.module';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { AscVolumeSliderModule } from 'src/app/components/input/volume-slider/volume-slider.module';
import {MatRippleModule} from '@angular/material/core';
import { AscLikeButtonModule } from 'src/app/components/buttons/like-button/like-button.module';

const routes: Routes = []

@NgModule({
  declarations: [
    StreamPlayerBarComponent,
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    RouterModule.forChild(routes),

    PipesModule,
    AscInputModule,
    AscImageModule,
    AscLikeButtonModule,
    AscVolumeSliderModule,

    MatButtonModule,
    MatSnackBarModule,
    MatRippleModule
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
