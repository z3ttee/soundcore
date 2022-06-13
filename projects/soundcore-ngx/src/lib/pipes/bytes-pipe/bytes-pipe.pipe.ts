import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'scngxBytesPipe'
})
export class SCNGXBytesPipe implements PipeTransform {

  transform(bytes: number, unit: "tb" | "gb" | "mb" | "kb" | "b" = "mb"): string {
    if(typeof bytes == "undefined" || bytes == null) return `${bytes || 0} B`;

    switch(unit){
      case "tb":
        return `${(bytes/1000000000000).toFixed(2)} ${unit.toUpperCase()}`;
      case "gb":
        return `${(bytes/1000000000).toFixed(2)} ${unit.toUpperCase()}`;
      case "mb":
        return `${(bytes/1000000).toFixed(2)} ${unit.toUpperCase()}`;
      case "kb":
        return `${(bytes/1000).toFixed(2)} ${unit.toUpperCase()}`;
      default:
        return `${bytes} ${unit.toUpperCase()}`;
    }
  }

}
