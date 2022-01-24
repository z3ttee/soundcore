import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { PlaylistListItemComponent } from "./components/list-items/playlist-list-item/playlist-list-item.component";
import { PipesModule } from "./pipes/pipes.module";
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [
        CommonModule,
        PipesModule,
        RouterModule
    ],
    declarations: [
        PlaylistListItemComponent,
    ],
    exports: [
        PlaylistListItemComponent,
    ]
})
export class AppCommonModule {}