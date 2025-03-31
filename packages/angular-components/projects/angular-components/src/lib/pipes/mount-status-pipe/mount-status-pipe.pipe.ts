import { Pipe, PipeTransform } from '@angular/core';
import { MountStatus } from '@repo/angular-sdk';

@Pipe({
    name: 'scngxMountStatusPipe',
    standalone: false
})
export class SCNGXMountStatusPipe implements PipeTransform {

  transform(status: MountStatus): string {
    switch (status) {
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
