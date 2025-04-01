import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgModule } from "@angular/core";
import { SCNGXTracklistBuilder } from "./utils/tracklist-builder";

@NgModule({
    providers: [
        SCNGXTracklistBuilder
    ],
    imports: [
        ScrollingModule
    ],
    exports: [
        ScrollingModule
    ]
})
export class SCNGXScrollingModule {}