import { Pipe, PipeTransform } from '@angular/core';
import { ZoneStatus } from '@soundcore/sdk';

@Pipe({
  name: 'scngxZoneStatus'
})
export class SCNGXZoneStatusPipe implements PipeTransform {

  transform(status: ZoneStatus): string {
    switch(status) {
      case ZoneStatus.UP:
        return "Online"
      default:
        return "Offline"
    }
  }

}
