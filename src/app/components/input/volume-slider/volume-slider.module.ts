import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AscVolumeSliderComponent } from './volume-slider.component';

@NgModule({
  declarations: [
    AscVolumeSliderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AscVolumeSliderComponent
  ]
})
export class AscVolumeSliderModule { }
