import { ModuleWithProviders, NgModule } from "@angular/core";

export const SCSDK_OPTIONS = "scsdk_options"
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