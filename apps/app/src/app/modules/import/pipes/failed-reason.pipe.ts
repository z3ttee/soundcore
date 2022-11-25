import { Pipe, PipeTransform } from "@angular/core";
import { FailedReason } from "@soundcore/sdk";

@Pipe({
    name: "failedReasonPipe"
})
export class FailedReasonPipe implements PipeTransform {

    transform(value: FailedReason): string {
        if(value == FailedReason.NOT_FOUND) {
            return "Nicht gefunden"
        } else {
            return "Fehlgeschlagen"
        }
    }
    
}