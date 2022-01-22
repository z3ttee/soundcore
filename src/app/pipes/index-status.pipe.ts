import { Pipe, PipeTransform } from '@angular/core';
import { ImportStatus } from '../features/import/entities/import.entity';
import { IndexStatus } from '../features/upload/enums/index-status.enum';

@Pipe({
  name: 'indexStatusPipe'
})
export class IndexStatusPipe implements PipeTransform {

  public transform(value: string | IndexStatus | ImportStatus): string {
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
      case "downloading" as ImportStatus:
        return "Wird heruntergeladen";
      default:
        return value;
    }
  }

}
