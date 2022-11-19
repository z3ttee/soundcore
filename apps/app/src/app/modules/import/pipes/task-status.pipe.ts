import { Pipe, PipeTransform } from "@angular/core";
import { ImportTaskStatus } from "@soundcore/sdk";

@Pipe({
    name: "taskStatusPipe"
})
export class TaskStatusPipe implements PipeTransform {

    transform(value: ImportTaskStatus): string {
        if(value == ImportTaskStatus.ENQUEUED) {
            return "Eingereiht"
        } else if(value == ImportTaskStatus.PROCESSING) {
            return "Wird verarbeitet"
        } else if(value == ImportTaskStatus.OK) {
            return "Abgeschlossen"
        } else if(value == ImportTaskStatus.SERVER_ABORT) {
            return "Vom System abgebrochen"
        } else {
            return "Fehlgeschlagen"
        }
    }
    
}