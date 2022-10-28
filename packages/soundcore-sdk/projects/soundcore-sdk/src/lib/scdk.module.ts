import { ModuleWithProviders, NgModule } from "@angular/core";

export const SCDK_OPTIONS = "scdk_options"
export interface SCDKOptions {
    api_base_uri: string;
}

@NgModule()
export class SCDKModule {

    public static forRoot(options: SCDKOptions): ModuleWithProviders<SCDKModule> {
        return {
            ngModule: SCDKModule,
            providers: [
                {
                    provide: SCDK_OPTIONS,
                    useValue: options
                }
            ]
        }
    }

}