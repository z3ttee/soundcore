import { Pipe, PipeTransform } from "@angular/core";
import { isNull } from "@soundcore/common";

@Pipe({
    name: 'durationPipe'
})
export class AppDurationPipe implements PipeTransform {
  
    transform(value: number): string {
        // Validate input and set to 0 if invalid
        if(isNull(value) || isNaN(value)) value = 0;
        // Initialize function to add padding to duration string
        const pad = function(num, size) { return ('000' + num).slice(size * -1); }
        
        // Calculate hours
        const hours = Math.floor(value / 60 / 60)
        // Calculate minutes
        const minutes = Math.floor(value / 60) % 60
        // Calculate seconds
        const seconds = Math.floor(value - minutes * 60)
    
        // Build duration string based on calculated values
        return (hours > 0 ? pad(hours, 1) + ":" : "") + pad(minutes, (hours > 0 ? 2 : 1)) + ':' + pad(seconds, 2);
    }
  
}