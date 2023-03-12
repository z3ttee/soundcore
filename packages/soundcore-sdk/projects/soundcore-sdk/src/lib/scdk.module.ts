import { ModuleWithProviders, NgModule } from "@angular/core";
import { SCDK_OPTIONS } from "./constants";

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