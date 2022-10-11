import { ModuleWithProviders, NgModule } from "@angular/core";
import { LottieModule, LottieCacheModule  } from 'ngx-lottie';
import { SCNGXScrollModule } from "./services/scroll/scroll.module";
import { HeroIconModule } from "ng-heroicon";
import { SCCDKModule, SCCDKOptions, SCCDK_OPTIONS } from "soundcore-cdk";

export const SCNGX_OPTIONS = "scngx-options";
export interface SCNGXOptions {
    cdk: SCCDKOptions
}

// Note we need a separate function as it's required
// by the AOT compiler.
export function playerFactory() {
    return import(/* webpackChunkName: 'lottie-web' */ 'lottie-web/build/player/lottie_svg');
}

@NgModule({
    imports: [
        SCCDKModule,
        LottieModule.forRoot({ player: playerFactory }), 
        LottieCacheModule.forRoot(),
        HeroIconModule.forRoot({}, {
            defaultHostDisplay: 'inlineBlock', // default 'none'
            attachDefaultDimensionsIfNoneFound: true // default 'false'
        }),

        SCNGXScrollModule,
    ],
    exports: [
        LottieModule,
        LottieCacheModule,
        SCCDKModule
    ],
    declarations: []
})
export class SCNGXModule {

    public static register(options: SCNGXOptions): ModuleWithProviders<SCNGXModule> {
        return {
            ngModule: SCNGXModule,
            providers: [
                {
                    provide: SCNGX_OPTIONS,
                    useValue: options
                },
                {
                    provide: SCCDK_OPTIONS,
                    useValue: options.cdk
                }
            ]
        }
    }

}