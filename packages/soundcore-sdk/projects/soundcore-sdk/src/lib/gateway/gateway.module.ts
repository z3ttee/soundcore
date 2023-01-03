import { NgModule } from "@angular/core";
import { SCSDKAdminGateway } from "./gateways/admin-gateway.gateway";
import { SCSDKGeneralGateway } from "./gateways/general-gateway.gateway";

@NgModule({
    providers: [
        SCSDKAdminGateway,
        SCSDKGeneralGateway
    ]
})
export class SCSDKGatewayModule { }