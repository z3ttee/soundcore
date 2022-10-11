import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCDKProfileService } from './services/profile.service';

@NgModule({
  providers: [
    SCDKProfileService
  ]
})
export class SCDKProfileModule { }
