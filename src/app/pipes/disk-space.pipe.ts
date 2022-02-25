import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "diskSpacePipe"
})
export class DiskSpacePipe implements PipeTransform {

    transform(value: number): string {
        if(!value) return "0 B"

        const gb = 1000000000;
        const mb = gb/1000;
        const kb = mb/1000;

        if(value >= gb) return `${(value/gb).toFixed(1)} GB`;
        if(value >= mb) return `${(value/mb).toFixed(1)} MB`;
        if(value >= kb) return `${(value/kb).toFixed(1)} KB`; 

        return `${(value/mb).toFixed(1)} B`; 
    }
  
  }