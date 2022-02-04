import { Pipe, PipeTransform } from "@angular/core";
import { PlaylistViewType } from "../playlist-view/playlist-view.component";

@Pipe({
    name: "playlistViewTypePipe"
})
export class PlaylistViewTypePipe implements PipeTransform {

    transform(value: PlaylistViewType): string {
        if(value == "artist") return "Künstler"
        if(value == "song") return "Song"
        if(value == "collection") return "Kollektion"
        if(value == "album") return "Album"
        if(value == "user") return "Nutzerprofil"
        return "Playlist"
    }

}