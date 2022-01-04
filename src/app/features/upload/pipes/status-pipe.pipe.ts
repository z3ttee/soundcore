import { Pipe, PipeTransform } from '@angular/core';
import { IndexStatus } from '../enums/index-status.enum';

@Pipe({
  name: 'statusPipe'
})
export class StatusPipePipe implements PipeTransform {

  public transform(value: IndexStatus): string {
    switch(value) {
      case IndexStatus.OK:
        return "Abgeschlossen";
      case IndexStatus.PREPARING:
        return "Wird vorbereitet";
      case IndexStatus.PROCESSING:
        return "Wird verarbeitet";
      case IndexStatus.UPLOADING:
        return "Wird hochgeladen";
      case IndexStatus.ERRORED:
        return "Fehlgeschlagen";
      case IndexStatus.ABORTED:
        return "Abgebrochen";
      case IndexStatus.DUPLICATE:
        return "Duplikat";
      default:
        return value;
    }
  }

}
