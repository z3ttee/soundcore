import { ModuleWithProviders, NgModule } from "@angular/core";
import { SCSDK_OPTIONS } from "./constants";

<<<<<<< HEAD
export const SCSDK_OPTIONS = "scsdk_options"
=======
>>>>>>> main
export interface SCSDKOptions {
    api_base_uri: string;
}

@NgModule()
export class SCSDKModule {

    public static forRoot(options: SCSDKOptions): ModuleWithProviders<SCSDKModule> {
        return {
            ngModule: SCSDKModule,
            providers: [
                {
                    provide: SCSDK_OPTIONS,
                    useValue: options
                }
            ]
        }
    }

}