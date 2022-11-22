import { Pipe, PipeTransform } from "@angular/core";
import { SpotifyFailedReason } from "@soundcore/sdk";

@Pipe({
    name: "failedReasonPipe"
})
export class FailedReasonPipe implements PipeTransform {

    transform(value: SpotifyFailedReason): string {
        if(value == SpotifyFailedReason.NOT_FOUND) {
            return "Nicht gefunden"
        } else {
            return "Fehlgeschlagen"
        }
    }
    
}