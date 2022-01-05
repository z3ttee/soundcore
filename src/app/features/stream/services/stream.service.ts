import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Song } from "src/app/model/song.model";

@Injectable({
    providedIn: 'root'
})
export class StreamService {

    // TODO: Handle audio errors
    
    private _currentSongSubject: BehaviorSubject<Song> = new BehaviorSubject(null)
    public $currentSong: Observable<Song> = this._currentSongSubject.asObservable();

    public async playSong(song: Song): Promise<void> {
        this._currentSongSubject.next(song)
    }

}