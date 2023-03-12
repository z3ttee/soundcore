import { NgModule } from "@angular/core";
import { SCSDKFactoryResetService } from "./services/factory-reset.service";

@NgModule({
    providers: [
        SCSDKFactoryResetService
    ]
})
export class SCSDKConfigureModule {}