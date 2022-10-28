import { NgModule } from "@angular/core";
import { SCDKNotificationGateway } from "./gateway/notification.gateway";
import { SCDKNotificationService } from "./services/notification.service";

@NgModule({
    providers: [
        SCDKNotificationService,
        SCDKNotificationGateway
    ],
    imports: [
        
    ]
})
export class SCDKNotificationModule {}