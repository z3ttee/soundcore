import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Album } from "src/app/model/album.model";
import { Artist } from "src/app/model/artist.model";
import { Song } from "../../song/entities/song.entity";

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

    /**
     * Play selected artist by creating a background queue containing the most popular songs of the artist.
     * @param artist Selected artist
     */
    public async playArtist(artist: Artist): Promise<void> {
        console.log("TODO: Play artist: " + artist.name)
    }

    /**
     * Play selected album by creating a background queue containing all songs of the album.
     * @param album Selected album
     */
     public async playAlbum(album: Album): Promise<void> {
        console.log("TODO: Play album: " + album.title)
    }

}