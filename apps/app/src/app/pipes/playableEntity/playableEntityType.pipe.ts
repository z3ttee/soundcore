import { Pipe, PipeTransform } from "@angular/core";
import { PlayableEntityType } from "@repo/angular-sdk";

@Pipe({
    name: 'playableEntityType',
    standalone: false
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