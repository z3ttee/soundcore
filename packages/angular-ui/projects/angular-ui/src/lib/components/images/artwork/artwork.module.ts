import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SCDKArtworkModule } from '@repo/angular-sdk';
import { SCNGXArtworkComponent } from './artwork.component';

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
