import { NgModule } from "@angular/core";
import { AppDurationPipe } from "./duration-pipe.pipe";

@NgModule({
    declarations: [
        AppDurationPipe
    ],
    exports: [
        AppDurationPipe
    ]
})
export class AppDurationPipeModule {}