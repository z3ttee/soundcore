import { ModuleWithProviders, NgModule } from "@angular/core";
import { SCCDKModule, SCCDKOptions, SCCDK_OPTIONS } from "@soundcore/cdk";
import { provideCacheableAnimationLoader, provideLottieOptions } from 'ngx-lottie';
import { SCNGXScrollModule } from "./services/scroll/scroll.module";

export const SCNGX_OPTIONS = "scngx-options";
export interface SCNGXOptions {
    cdk: SCCDKOptions
}

@NgModule({
    imports: [
        SCCDKModule,
        SCNGXScrollModule,
    ],
    providers: [
        provideLottieOptions({
            player: () => import('lottie-web'),
        }),
        provideCacheableAnimationLoader(),
    ],
    exports: [
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