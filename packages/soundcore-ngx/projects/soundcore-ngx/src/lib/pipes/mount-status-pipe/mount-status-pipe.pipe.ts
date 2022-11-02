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
      case MountStatus.SCANNING:
        return "Wird überprüft"
      case MountStatus.INDEXING:
        return "Wird indexiert"
      default:
        return "Verfügbar"
    }
  }

}
