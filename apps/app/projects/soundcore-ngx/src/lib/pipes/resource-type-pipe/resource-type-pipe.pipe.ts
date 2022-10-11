import { Pipe, PipeTransform } from '@angular/core';
import { SCDKResourceType } from 'soundcore-sdk';

@Pipe({
  name: 'scngxResourceTypePipe'
})
export class SCNGXResourceTypePipe implements PipeTransform {

  transform(value: SCDKResourceType): string {
    switch(value) {
      case "artist":
        return "Künstler"

      default:
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
  }

}
