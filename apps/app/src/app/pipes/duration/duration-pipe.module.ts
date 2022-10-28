import { NgModule } from "@angular/core";
import { SCDurationPipe } from "./duration-pipe.pipe";

@NgModule({
    declarations: [
        SCDurationPipe
    ],
    exports: [
        SCDurationPipe
    ]
})
export class SCDurationPipeModule {}