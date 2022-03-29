import { DatePipe } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "addedToPlaylist"
})
export class AddedToPlaylistPipe implements PipeTransform {
    
    public transform(value: Date): string {
        if(!value) return "---";

        return new DatePipe("en-US").transform(value, 'dd/MM/yyyy')
    }

}