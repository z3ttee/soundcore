import { Pipe, PipeTransform } from '@angular/core';
import { MountStatus } from '@soundcore/sdk';

@Pipe({
  name: 'scngxMountStatusPipe'
})
export class SCNGXMountStatusPipe implements PipeTransform {

  transform(status: MountStatus): string {
    switch(status) {
      case MountStatus.ENQUEUED:
        return "Eingereiht"
      case MountStatus.BUSY:
        return "Wird gescannt"
      case MountStatus.ERRORED:
        return "Fehler aufgetreten"
      default:
        return "Verfügbar"
    }
  }

}
