import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';

@Pipe({
  name: 'scngxAddedToPlaylistPipe'
})
export class SCNGXAddedToPlaylistPipe implements PipeTransform {

  public transform(value: Date): Observable<string> {
    if(!value) return of("No Date available");

    /*return timer(5000).pipe(map(() => {
      return new DatePipe("en-US").transform(value, 'dd/MM/yyyy');
    }));*/

    return of(new DatePipe("en-US").transform(value, 'dd/MM/yyyy'));
  }

}
