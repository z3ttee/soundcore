import { ModuleWithProviders, NgModule } from "@angular/core";
import { SCNGXScreenConfig } from "./config/screen.config";

export const SCNGX_OPTIONS = "scngx-options";
export interface SCNGXOptions {
    screen: SCNGXScreenConfig
}

@NgModule({

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