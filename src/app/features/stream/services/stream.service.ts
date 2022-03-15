import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthenticationService } from "src/sso/services/authentication.service";
import { Song } from "../../song/entities/song.entity";
import { StreamToken } from "../entities/stream-token.entity";

@Injectable()
export class StreamService {

    // TODO: Handle audio errors
    
    /*private _currentSongSubject: BehaviorSubject<Song> = new BehaviorSubject(null)
    private _pauseEventSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
    private _statusSubject: BehaviorSubject<StreamStatus> = new BehaviorSubject({} as StreamStatus);

    public $currentSong: Observable<Song> = this._currentSongSubject.asObservable();
    public $pauseEvent: Observable<boolean> = this._pauseEventSubject.asObservable();
    public $player: Observable<StreamStatus> = this._statusSubject.asObservable();

    private audio = new Audio();*/

    constructor(
        private httpClient: HttpClient,
        private authService: AuthenticationService
    ) {}

    public async getStreamURL(token: StreamToken) {
        if(!token) return "";
        return `${environment.api_base_uri}/v1/streams/songs?token=${token.token}`;
    }

    public async getTokenForSong(song: Song): Promise<StreamToken> {
        if(!song) return null;
        return firstValueFrom(this.httpClient.get<StreamToken>(`${environment.api_base_uri}/v1/streams/token/${song.id}`));
    }

    /*public async forcePlay(song: Song) {
        console.log("[STREAM] Force play: " + song.title)
        this.audioService.forcePlay(song)
    }*/

    /**
     * Play the audio stream.
     * This emits false on the $paused observable.
     */
    /*public async play(): Promise<void> {
        this._pauseEventSubject.next(false)
    }*/

    /**
     * Pause the audio stream.
     * This emits true on the $paused observable.
     */
    /*public async pause(): Promise<void> {
        this._pauseEventSubject.next(true)
    }*/

    /**
     * Play selected song.
     * @param song Selected song
     */
    /*public async playSong(song: Song): Promise<void> {
        // this.audio.src = await this.getStreamURL(song);
        // this.audio.play()
        // this._currentSongSubject.next(song)
    }*/

    /**
     * Play selected artist by creating a background queue containing the most popular songs of the artist.
     * @param artist Selected artist
     */
    /*public async playArtist(artist: Artist): Promise<void> {
        console.log("TODO: Play artist: " + artist.name)
    }*/

    /**
     * Play selected album by creating a background queue containing all songs of the album.
     * @param album Selected album
     */
    /*public async playAlbum(album: Album): Promise<void> {
        console.log("TODO: Play album: " + album.title)
    }*/

    /**
     * Check if the audio player is paused.
     * @returns True or False
     */
    /*public isPaused(): boolean {
        return this._statusSubject.getValue()?.paused;
    }

    public async setStatus(streamStatus: StreamStatus): Promise<void> {
        this._statusSubject.next(streamStatus);
    }*/

}