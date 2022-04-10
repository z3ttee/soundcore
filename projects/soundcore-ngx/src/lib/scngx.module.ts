import { ModuleWithProviders, NgModule } from "@angular/core";
import { SCNGXScreenConfig } from "./config/screen.config";
import { LottieModule, LottieCacheModule  } from 'ngx-lottie';

export const SCNGX_OPTIONS = "scngx-options";
export interface SCNGXOptions {
    screen: SCNGXScreenConfig
}

// Note we need a separate function as it's required
// by the AOT compiler.
export function playerFactory() {
    return import(/* webpackChunkName: 'lottie-web' */ 'lottie-web/build/player/lottie_svg');
}

@NgModule({
    imports: [
        LottieModule.forRoot({ player: playerFactory }), 
        LottieCacheModule.forRoot()
    ],
    exports: [
        LottieModule,
        LottieCacheModule
    ]
})
export class SCNGXModule {

    public static register(options: SCNGXOptions): ModuleWithProviders<SCNGXModule> {
        return {
            ngModule: SCNGXModule,
            providers: [
                {
                    provide: SCNGX_OPTIONS,
                    useValue: options
                }
            ]
        }
    }

}