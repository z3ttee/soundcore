import { Pipe, PipeTransform } from '@angular/core';
import { FileFlag, SCDKResourceFlag } from 'soundcore-sdk';

@Pipe({
  name: 'scngxFileFlagPipe'
})
export class SCNGXFileFlagPipe implements PipeTransform {

  transform(flag: FileFlag): string {
    switch(flag) {
      case FileFlag.PROCESSING:
        return "Wird verarbeitet"
      case FileFlag.DELETED:
        return "Löschung vorgemerkt"
      case FileFlag.CORRUPT:
        return "Fehlerhaft"
      case FileFlag.FAILED_SONG_CREATION:
        return "Fehler bei Metadaten"
      case FileFlag.DUPLICATE:
        return "Duplikat"
      default:
        return "Verfügbar"
    }
  }

}
