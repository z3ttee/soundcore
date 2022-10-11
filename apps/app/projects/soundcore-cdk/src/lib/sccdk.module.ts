import { ModuleWithProviders, NgModule } from "@angular/core";
import { SCCDKScreenConfig } from "./screen/screen.config";
import { SCCDKScreenModule } from "./screen/screen.module";

export const SCCDK_OPTIONS = "sccdk-options";
export interface SCCDKOptions {
    screen: SCCDKScreenConfig
}

@NgModule({
    imports: [
        SCCDKScreenModule
    ],
    exports: [
        SCCDKScreenModule
    ]
})
export class SCCDKModule {

    public static register(options: SCCDKOptions): ModuleWithProviders<SCCDKModule> {
        return {
            ngModule: SCCDKModule,
            providers: [
                {
                    provide: SCCDK_OPTIONS,
                    useValue: options
                }
            ]
        }
    }

}