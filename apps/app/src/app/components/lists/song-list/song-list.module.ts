import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SCNGXScrollingModule } from "@soundcore/ngx";
import { SongListComponent } from "./song-list.component";
import { SCNGXSongListItemModule } from "../../list-items/song-list-item/song-list-item.module";
import { SongContextMenuModule } from "../../menus/song-context-menu/song-context-menu.module";

@NgModule({
    declarations: [
        SongListComponent,
    ],
    imports: [
        CommonModule,
        SCNGXScrollingModule,
        SCNGXSongListItemModule,
        SongContextMenuModule
    ],
    exports: [
        SongListComponent
    ]
})
export class SongListModule {}