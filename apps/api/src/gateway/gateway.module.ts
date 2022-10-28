import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { AdminGateway } from "./gateways/admin-gateway.gateway";

@Module({
    providers: [
        AdminGateway
    ],
    imports: [
        UserModule
    ],
    exports: [
        AdminGateway
    ]
})
export class GatewayModule { }