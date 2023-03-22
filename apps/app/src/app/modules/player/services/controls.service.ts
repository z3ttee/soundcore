import { Observable, Subject } from "rxjs";

export class AudioController {

    private readonly onEnded: Subject<void> = new Subject();
    public readonly $onEnded: Observable<void> = this.onEnded.asObservable();

    constructor(
        private readonly audioElement: HTMLAudioElement
    ) {
        this.audioElement.onended = (event) => {
            this.onEnded.next();
        }
    }

    public play(url: string): Observable<string> {
        return new Observable((subscriber) => {
            this.audioElement.src = url;
            this.audioElement.play().finally(() => {
                // Complete observable after starting to play
                subscriber.next(url);
                subscriber.complete();
            });
        });
    }

}