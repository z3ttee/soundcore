import { Pipe, PipeTransform } from '@angular/core';
import { FileFlag } from '@soundcore/sdk';

@Pipe({
  name: 'scngxFileFlagPipe'
})
export class SCNGXFileFlagPipe implements PipeTransform {

  transform(flag: FileFlag): string {
    switch(flag) {
      case FileFlag.PENDING_ANALYSIS:
        return "Warten auf Indexierung"
      case FileFlag.POTENTIAL_DUPLICATE:
        return "Potenzielles Duplikat"
      case FileFlag.ERROR:
        return "Fehlerhaft"
      case FileFlag.INVALID_PATH_ENCODING:
        return "Fehlerhafter Pfad"
      default:
        return "Verfügbar"
    }
  }

}
