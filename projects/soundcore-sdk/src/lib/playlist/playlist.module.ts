import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { SCDKPlaylistService } from "./services/playlist.service";

@NgModule({
    providers: [
        SCDKPlaylistService
    ],
    imports: [
        HttpClientModule
    ]
})
export class SCDKPlaylistModule { }