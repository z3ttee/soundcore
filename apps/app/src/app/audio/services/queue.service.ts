import { Injectable } from "@angular/core";
import { Song } from "@soundcore/sdk";
import { Observable, Subject } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class AudioQueueService {

    private readonly _queue: Song[] = [];
    private readonly _onWaitingSubject: Subject<void> = new Subject();

    public readonly $onWaiting: Observable<void> = this._onWaitingSubject.asObservable();

    public enqueue(item: Song) {
        this._queue.push(item);
        this._onWaitingSubject.next();
    }

    public dequeue(): Song {
        return this._queue.shift();
    }

    public get isEmpty(): number {
        return this._queue.length;
    }

    public get size(): number {
        return this._queue.length;
    }

}