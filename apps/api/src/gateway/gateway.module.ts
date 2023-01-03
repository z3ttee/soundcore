import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { AdminGateway } from "./gateways/admin-gateway.gateway";
import { GeneralGateway } from "./gateways/general-gateway.gateway";

@Module({
    providers: [
        AdminGateway,
        GeneralGateway
    ],
    imports: [
        UserModule
    ],
    exports: [
        AdminGateway,
        GeneralGateway
    ]
})
export class GatewayModule { }