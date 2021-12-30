import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioplayerComponent } from './audioplayer.component';
import { AudioplayerService } from './services/audioplayer.service';
import { AppCommonModule } from 'src/app/common.module';

@NgModule({
  declarations: [
    AudioplayerComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule
  ],
  providers: [
    AudioplayerService
  ],
  exports: [
    AudioplayerComponent
  ]
})
export class AudioplayerModule { }
