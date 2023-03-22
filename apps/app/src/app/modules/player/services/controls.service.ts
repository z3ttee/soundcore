import { Injectable } from "@angular/core";
import { isNull } from "@soundcore/common";
import { SCSDKStreamService, Song } from "@soundcore/sdk";
import { Observable, Subject } from "rxjs";
import { PlayableItem } from "./player.service";

@Injectable()
export class AudioController {

    private readonly audioEl = new Audio();

    private readonly onEnded: Subject<void> = new Subject();
    public readonly $onEnded: Observable<void> = this.onEnded.asObservable();

    constructor(
        private readonly streamService: SCSDKStreamService
    ) {
        this.audioEl.onended = (event) => {
            this.onEnded.next();
        }
    }

    public play(item: PlayableItem): Observable<string> {
        return new Observable<string>((subscriber) => {
            const song = item.song ?? item as Song;

            // Complete observable if song is null
            if(isNull(song)) {
                subscriber.next(null);
                subscriber.complete();
                return;
            }

            // Add stream url request to observable
            subscriber.add(this.streamService.requestStreamUrl(song.id).subscribe((streamUrl) => {
                // Update src on audio element
                this.audioEl.src = streamUrl;
                this.audioEl.play().finally(() => {
                    // Complete observable after starting to play
                    subscriber.next(streamUrl);
                    subscriber.complete();
                });
            }));
        });
    }

}