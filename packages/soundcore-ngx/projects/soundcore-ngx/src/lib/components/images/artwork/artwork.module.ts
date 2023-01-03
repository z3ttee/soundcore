import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCNGXArtworkComponent } from './artwork.component';
import { SCDKArtworkModule } from '@soundcore/sdk';

@NgModule({
  declarations: [
    SCNGXArtworkComponent
  ],
  imports: [
    CommonModule,
    SCDKArtworkModule
  ],
  exports: [
    SCNGXArtworkComponent
  ]
})
export class SCNGXArtworkModule { }
