import { NgModule } from "@angular/core";
import { SCSDKAdminGateway } from "./gateways/admin-gateway.gateway";

@NgModule({
    providers: [
        SCSDKAdminGateway
    ]
})
export class SCSDKGatewayModule { }