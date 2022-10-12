import { Pipe, PipeTransform } from '@angular/core';
import { SCDKResourceFlag } from '@soundcore/sdk';

@Pipe({
  name: 'scngxBucketFlagPipe'
})
export class SCNGXBucketFlagPipe implements PipeTransform {

  transform(flag: SCDKResourceFlag): unknown {
    switch(flag) {
      case SCDKResourceFlag.OK:
        return "Verfügbar"
      default:
        return "Fehlherhaft"
    }
  }

}
