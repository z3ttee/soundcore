import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { EmptyPageBannerComponent } from "./empty-page-banner.component";
import { LottieModule } from "ngx-lottie";

@NgModule({
    declarations: [
        EmptyPageBannerComponent
    ],
    imports: [
        CommonModule,
        LottieModule,
    ],
    exports: [
        EmptyPageBannerComponent
    ]
})
export class EmptyPageBannerModule {}