import { NgModule } from "@angular/core";
import { PlayableEntityTypePipe } from "./playableEntityType.pipe";

@NgModule({
    declarations: [
        PlayableEntityTypePipe
    ],
    exports: [
        PlayableEntityTypePipe
    ]
})
export class PlayableEntityTypePipeModule {}