import { Pipe, PipeTransform } from '@angular/core';
import { MountStatus } from 'soundcore-sdk';

@Pipe({
  name: 'scngxMountStatusPipe'
})
export class SCNGXMountStatusPipe implements PipeTransform {

  transform(status: MountStatus): string {
    switch(status) {
      case MountStatus.BUSY:
        return "Wird überprüft"
      default:
        return "Verfügbar"
    }
  }

}
