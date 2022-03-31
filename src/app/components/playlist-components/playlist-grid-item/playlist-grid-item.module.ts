import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AscImageModule } from "../../image-components/image-components.module";
import { PlaylistGridItemComponent } from "./playlist-grid-item.component";

@NgModule({
    declarations: [
        PlaylistGridItemComponent
    ],
    imports: [
        RouterModule,
        AscImageModule
    ],
    exports: [
        PlaylistGridItemComponent
    ]
})
export class AscPlaylistGridItemModule {}