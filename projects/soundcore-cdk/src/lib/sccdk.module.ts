import { ModuleWithProviders, NgModule } from "@angular/core";
import { SCCDKScreenModule } from "soundcore-cdk";
import { SCCDKScreenConfig } from "./screen copy/screen.config";

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