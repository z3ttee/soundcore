import { Injectable } from "@angular/core";
import { LikedSong, PlaylistItem, SCSDKStreamService, Song } from "@soundcore/sdk";
import { BehaviorSubject, Observable, switchMap } from "rxjs";
import { ResourceWithTracklist } from "../entities/resource-with-tracklist.entity";
import { AudioController } from "./controls.service";
import { AudioQueue } from "./queue.service";

export type PlayableItem = Song & PlaylistItem & LikedSong

@Injectable()
export class PlayerService {

    private readonly currentItem: BehaviorSubject<PlayableItem> = new BehaviorSubject(null);
    public readonly $currentItem = this.currentItem.asObservable();

    constructor(
        private readonly queue: AudioQueue,
        private readonly controls: AudioController,
        private readonly streamService: SCSDKStreamService
    ) {
        // Handle ended event on audio element
        this.controls.$onEnded.pipe(
            switchMap(() => this.next()),
            switchMap((item) => {
                // Update current item
                this.currentItem.next(item);
                // Request stream url
                return this.streamService.requestStreamUrl(item.id);
            }),
            // Start playing the item
            switchMap((url) => this.controls.play(url))
        ).subscribe((streamUrl) => {
            console.log(`Now streaming ${streamUrl}`);
        });
    }

    public playNext(resource: ResourceWithTracklist<PlayableItem>) {
        const positionInQueue = this.queue.enqueue(resource);
        console.log(`Enqueued tracklist entity at position ${positionInQueue}`);
    }

    public forcePlay(resource: ResourceWithTracklist<PlayableItem>) {
        
    }

    private next(): Observable<PlayableItem> {
        return new Observable<PlayableItem>((subscriber) => {
            // Resource can be Album, Song, Playlist etc.
            const nextResource = this.queue.dequeue();

            subscriber.add(nextResource.tracklist.getNextItem().subscribe((nextItem) => {
                subscriber.next(nextItem);
                subscriber.complete();
            }));
        });
    }

}