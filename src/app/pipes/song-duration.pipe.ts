import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'songDurationPipe'
})
export class SongDurationPipe implements PipeTransform {

  transform(value: number): string {
    const pad = function(num, size) { return ('000' + num).slice(size * -1); }
    
    const hours = Math.floor(value / 60 / 60)
    const minutes = Math.floor(value / 60) % 60
    const seconds = Math.floor(value - minutes * 60)

    return (hours > 0 ? pad(hours, 1) + ":" : "") + pad(minutes, (hours > 0 ? 2 : 1)) + ':' + pad(seconds, 2);
  }

}
