import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Song } from "../model/song.model";

@Injectable({
    providedIn: 'root'
})
export class StreamService {
    
    private _currentSongSubject: BehaviorSubject<Song> = new BehaviorSubject(null)
    public $currentSong: Observable<Song> = this._currentSongSubject.asObservable();

    public async playSong(song: Song): Promise<void> {
        console.log(song)
        this._currentSongSubject.next(song)
    }

}