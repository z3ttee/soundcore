import { Pipe, PipeTransform } from "@angular/core";
import { FailedReason } from "@repo/angular-sdk";

@Pipe({
    name: "failedReasonPipe",
    standalone: false
})
export class FailedReasonPipe implements PipeTransform {

    transform(value: FailedReason): string {
        if (value == FailedReason.NOT_FOUND) {
            return "Nicht gefunden"
        } else {
            return "Fehlgeschlagen"
        }
    }

}