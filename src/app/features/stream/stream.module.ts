import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamPlayerBarComponent } from './components/stream-player-bar/stream-player-bar.component';

import { AppCommonModule } from "../../common.module"
import { SeekerComponent } from 'src/app/components/seeker/seeker.component';
import { DurationPipePipe } from './pipes/duration-pipe.pipe';

@NgModule({
  declarations: [
    StreamPlayerBarComponent,
    SeekerComponent,
    DurationPipePipe
  ],
  imports: [
    CommonModule,
    AppCommonModule
  ],
  exports: [
    StreamPlayerBarComponent
  ]
})
export class StreamModule { }
