import { Pipe, PipeTransform } from "@angular/core";
import { isNull } from "@soundcore/common";
import { PlayableEntityType } from "@soundcore/sdk";

@Pipe({
    name: 'playableEntityType'
})
export class PlayableEntityTypePipe implements PipeTransform {
  
    transform(value: PlayableEntityType): string {
        switch (value) {
            case PlayableEntityType.PLAYLIST:
                return "Playlist";
            case PlayableEntityType.ALBUM:
                return "Album";
            case PlayableEntityType.ARTIST:
            case PlayableEntityType.ARTIST_TOP:
                return "Künstler";
            default:
                return "Titel";
        }
    }
  
}