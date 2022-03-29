import { Pipe, PipeTransform } from "@angular/core";
import { PlaylistPrivacy } from "../features/playlist/types/playlist-privacy.types";

@Pipe({
    name: "playlistPrivacyPipe"
})
export class PlaylistPrivacyPipe implements PipeTransform {

    transform(value: PlaylistPrivacy): string {
        if(value == "not_listed") return "Nicht gelistet"
        if(value == "private") return "Privat"
        return "Öffentlich"
    }
  
  }