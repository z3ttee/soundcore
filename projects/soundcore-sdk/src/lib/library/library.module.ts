import { NgModule } from "@angular/core";
import { SCDKPlaylistModule } from "../playlist/playlist.module";
import { SCDKLibraryService } from "./services/library.service";

@NgModule({
    providers: [
        SCDKLibraryService
    ],
    imports: [
        SCDKPlaylistModule
    ]
})
export class SCDKLibraryModule {}