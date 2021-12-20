import { Pipe, PipeTransform } from "@angular/core";
import { Artist } from "../model/artist.model";

@Pipe({
    name: "songArtistsJoin"
})
export class SongArtistsPipe implements PipeTransform {
    
    public transform(value: Artist[]): string {
        return value.map((artist) => artist.name).join(", ");
    }

}