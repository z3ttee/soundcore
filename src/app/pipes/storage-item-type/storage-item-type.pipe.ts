import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'storageItemTypePipe'
})
export class StorageItemTypePipe implements PipeTransform {

  transform(value): string {
    if(value == "index") return "Datei";
    if(value == "mount") return "Mount";
    if(value == "bucket") return "Speicherzone";

    return "Unknown type";
  }

}
