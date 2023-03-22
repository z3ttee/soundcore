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

@Injectable()
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

        // If the type is anything else,
        // enqueue the item by pushing to the array
        return this.queue.push(resource);
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
        if(next.tracklist.isQueueEmpty) {
            // Remove item if empty
            this.queue.shift();
            // Recursive call to continue with next item if exists
            return this.dequeue();
        }

        return next;
    }
    
}