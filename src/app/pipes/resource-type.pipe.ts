import { Pipe, PipeTransform } from '@angular/core';
import { SearchBestMatchType } from '../features/search/entities/best-match.entity';

@Pipe({
  name: 'resourceTypePipe'
})
export class ResourceTypePipe implements PipeTransform {

  transform(value: SearchBestMatchType): string {
    if(value == "album") return "Album";
    if(value == "song") return "Song";
    if(value == "playlist") return "Playlist";
    if(value == "artist") return "Künstler";
    if(value == "distributor" || value == "publisher") return "Herausgeber";
    if(value == "label") return "Label";
    if(value == "genre") return "Genre";
    if(value == "user") return "Nutzerprofil";


    return value;
  }

}
