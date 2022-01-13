import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "totalPlaylistDuration"
})
export class TotalPlaylistDurationPipe implements PipeTransform {

    transform(value: number): string {
        if(!value) return "0 min."
        const pad = function(num, size) { return ('000' + num).slice(size * -1); }
        
        const hours = Math.floor(value / 60 / 60)
        const minutes = Math.floor(value / 60) % 60
        // const seconds = Math.floor(value - minutes * 60)

        console.log(minutes)

        let result = "";
        if(hours > 0) {
            result += `${hours} Std. `
        }

        result += `${pad(minutes, (hours > 0 || minutes >= 10 ? 2 : 1))} min.`
        return result;
    }
  
  }