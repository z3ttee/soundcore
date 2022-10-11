import { Observable, of } from "rxjs";
import { Song } from "@soundcore/sdk";
import { SCNGXPlayableSource } from "./playable-source.entity";

export class SCNGXPlayableSong extends SCNGXPlayableSource {

    constructor(
        private readonly song: Song
    ) {
        super();
    }

    protected findByTrack(): Observable<Song> {
        return of(this.song);
    }
    
}