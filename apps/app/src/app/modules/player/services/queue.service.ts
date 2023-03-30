import { Injectable } from "@angular/core";
import { hasProperty, isNull } from "@soundcore/common";
import { Future } from "@soundcore/sdk";
import { Observable } from "rxjs";
import { ResourceWithTracklist } from "../entities/resource-with-tracklist.entity";
import { PlayableItem } from "./player.service";

class EnqueuedItem<T = any> {
    constructor(
        public isList: boolean,
        public data: T
    ) {}
}

@Injectable({
    providedIn: "any"
})
export class AudioQueue {

    /**
     * Map to efficiently track which resources are already enqueued,
     * so we do not have to loop through whole queue to find a resource
     */
    private readonly enqueuedIds: Map<string, any> = new Map();
    /**
     * Internal queue list
     */
    private readonly queue: EnqueuedItem<PlayableItem | ResourceWithTracklist<PlayableItem>>[] = [];

    /**
     * Add a resource to the queue. Based on the tracklist type,
     * the resource will be added to the beginning or to the end of the queue
     * @param resource Resource to enqueue
     * @returns Position the resource was added to
     */
    public enqueue(resource: PlayableItem | ResourceWithTracklist<PlayableItem>): number {
        // Register id as enqueued
        this.enqueuedIds.set(resource.id, true);

        // If the item should be enqueued as single
        if(!this.isOfTypeList(resource)) {
            return this.queue.unshift({ isList: false, data: resource }) - 1;
        }

        // Otherwise push to end of queue
        return this.queue.push({ isList: true, data: resource }) - 1;
    }

    public dequeue(): EnqueuedItem<PlayableItem | ResourceWithTracklist<PlayableItem>> {
        const next = this.queue[0];
        if(isNull(next)) return null;

        if(!next.isList) {
            // Remove from registered ids
            this.enqueuedIds.delete(next.data.id);
            // Is a single song, so splice it from queue
            return this.queue.splice(0, 1)?.[0];
        }

        const data = next.data as ResourceWithTracklist<PlayableItem>;
        const tracklist = data.tracklist;

        // Check if tracklist has not ended, if true
        // return, otherwise remove from queue
        if(!tracklist.hasEnded) {
            return next;
        }

        // Remove from registered ids
        this.enqueuedIds.delete(data.id);
        // Release tracklist resources
        tracklist.release();
        // Remove from queue
        this.queue.shift();
        // Return new dequeue attempt
        return this.dequeue();
    }

    /**
     * Clear the queue
     */
    public clear(): Observable<Future<void>> {
        return new Observable((subscriber) => {
            // Push loading state
            subscriber.next(Future.loading());

            // Find tracklists and release all
            this.findTracklists().forEach((item) => {
                item.data?.tracklist?.release();
            });
            // Remove all items by splicing array
            this.queue.splice(0, this.queue.length);

            // Complete observable
            subscriber.next(Future.of(void 0));
            subscriber.complete();
        });
    }

    /**
     * Check if an item is already enqueued
     * @param id Id of the resource
     */
    public isEnqueued(id: string): boolean {
        return this.enqueuedIds.has(id);
    }

    public findById(id: string): EnqueuedItem<PlayableItem | ResourceWithTracklist<PlayableItem>> {
        if(!this.isEnqueued(id)) return null;
        return this.queue.find((item) => item.data?.id === id);
    }

    /**
     * Find a list of enqueued tracklists
     */
    public findTracklists(): EnqueuedItem<ResourceWithTracklist<PlayableItem>>[] {
        const tracklists: EnqueuedItem<ResourceWithTracklist<PlayableItem>>[] = [];
        // Loop through queue, beginning at end and 
        // go backwards (because all tracklists are 
        // at end of the queue)
        for(let i = this.queue.length - 1; i >= 0; i--) {
            const item = this.queue[i];
            // Break as soon as there is no tracklist in the queue
            if(!this.isOfTypeList(item.data)) break;
            // If is tracklist, push to results arr
            tracklists.push(item as EnqueuedItem<ResourceWithTracklist<PlayableItem>>);
        }

        // Return reversed results array.
        // This is done because the results arr has last-index as first
        // one because of looping backwards
        return tracklists.reverse();
    }

    public findTracklistById(id: string): EnqueuedItem<ResourceWithTracklist<PlayableItem>> {
        if(!this.isEnqueued(id)) return null;

        // return this.queue.find((item) => item.isList && item.data?.id === id) as EnqueuedItem<ResourceWithTracklist<PlayableItem>>;
        return this.findTracklists().find((item) => item.isList && item.data?.id === id)
    }

    private isOfTypeList(item: any): boolean {
        return hasProperty("tracklist", item);
    }
    
}