import { Pipe, PipeTransform } from "@angular/core";
import { Artist } from "../features/artist/entities/artist.entity";

@Pipe({
    name: "songArtistsJoin"
})
export class SongArtistsPipe implements PipeTransform {
    
    public transform(value: Artist[]): string {
        if(!value) return "Unknown artist";
        return value.map((artist) => artist.name).join(", ");
    }

}