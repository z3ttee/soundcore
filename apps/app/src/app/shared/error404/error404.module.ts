import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { LottieComponent, LottieDirective } from "ngx-lottie";
import { Error404Component } from './error404.component';

@NgModule({
  imports: [
    CommonModule,
    LottieComponent,
    LottieDirective
  ],
  declarations: [
    Error404Component
  ],
  exports: [
    Error404Component
  ]
})
export class Error404Module { }