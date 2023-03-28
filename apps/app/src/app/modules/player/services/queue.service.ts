import { Injectable } from "@angular/core";
import { isNull } from "@soundcore/common";
import { Song, TracklistTypeV2 } from "@soundcore/sdk";
import { Observable } from "rxjs";
import { ResourceWithTracklist } from "../entities/resource-with-tracklist.entity";
import { PlayableItem } from "./player.service";

class EnqueuedItem<T = any> {
    constructor(
        public isSingle: boolean,
        public data: T
    ) {}
}

@Injectable({
    providedIn: "root"
})
export class AudioQueue {

    private readonly queue: ResourceWithTracklist<PlayableItem>[] = [];

    /**
     * Add a resource to the queue. Based on the tracklist type,
     * the resource will be added to the beginning or to the end of the queue
     * @param resource Resource to enqueue
     * @returns Position the resource was added to
     */
    public enqueue(resource: ResourceWithTracklist<PlayableItem>): number {
        // Init tracklist variable
        const tracklist = resource.tracklist;

        // If the tracklist represents a single song,
        // put it on the top of the queue (so it is played next)
        if(tracklist.type === TracklistTypeV2.SINGLE) {
            this.queue.unshift(resource);
            return 0;
        }

        // Check if there is already an actual list in the queue
        const tracklistIndex = Math.max(0, this.queue.length - 1);
        if(!isNull(this.queue[tracklistIndex]) && this.queue[tracklistIndex]?.tracklist?.type !== TracklistTypeV2.SINGLE) {
            // If true, overwrite it
            this.queue[tracklistIndex] = resource;
            return tracklistIndex;
        }

        // If the type is anything else,
        // enqueue the item by pushing to the array
        const position = this.queue.push(resource) - 1;
        return position;
    }

    public dequeue(): ResourceWithTracklist<PlayableItem> {
        const next = this.queue[0];
        if(isNull(next)) return null;

        // If the next item represents a single song,
        // just remove the item from the queue and return it
        if(next.tracklist.type === TracklistTypeV2.SINGLE) {
            return this.queue.shift();
        }

        // Otherwise the item represents an actual tracklist, so we have
        // to access the internal queue of that tracklist and only dequeue it,
        // if that queue is empty
        if(next.tracklist.hasEnded) {
            // Remove item if empty
            this.queue.shift();
            // Recursive call to continue with next item if exists
            return this.dequeue();
        }

        return next;
    }

    public getEnqueuedTracklist() {
        const resource = this.queue[this.queue.length - 1];
        // If the last enqueued resource is a single song, return null as
        // this is not a tracklist
        if(resource.tracklist.type === TracklistTypeV2.SINGLE) return null;

        return resource;
    }

    public isTracklistEnqueued(id: string): boolean {
        return this.getEnqueuedTracklist()?.id === id;
    }
    
}