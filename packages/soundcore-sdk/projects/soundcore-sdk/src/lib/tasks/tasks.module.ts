import { NgModule } from "@angular/core";
import { SCSDKTasksService } from "./services/tasks.service";

@NgModule({
    providers: [
        SCSDKTasksService
    ]
})
export class SCSDKTasksModule {}