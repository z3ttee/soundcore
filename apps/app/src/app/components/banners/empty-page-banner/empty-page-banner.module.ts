import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { LottieComponent, LottieDirective } from "ngx-lottie";
import { EmptyPageBannerComponent } from "./empty-page-banner.component";

@NgModule({
    declarations: [
        EmptyPageBannerComponent
    ],
    imports: [
        CommonModule,
        LottieComponent,
        LottieDirective
    ],
    exports: [
        EmptyPageBannerComponent
    ]
})
export class EmptyPageBannerModule { }