import { Injectable } from "@angular/core";
import { isNull } from "@soundcore/common";
import { Future, PlayableEntityType } from "@soundcore/sdk";
import { BehaviorSubject, Observable } from "rxjs";
import { PlayableItem } from "./player.service";
import { SCNGXTracklist } from "../entities/tracklist.entity";

export class EnqueuedItem<T = PlayableItem | SCNGXTracklist> {
    constructor(
        public isList: boolean,
        public data: T
    ) {}
}

@Injectable({
    providedIn: "platform"
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
    private readonly queueSubject: BehaviorSubject<EnqueuedItem[]> = new BehaviorSubject([]);

    public readonly $queue = this.queueSubject.asObservable();

    /**
     * Add a resource to the queue. Based on the tracklist type,
     * the resource will be added to the beginning or to the end of the queue
     * @param resource Resource to enqueue
     * @returns Position the resource was added to
     */
    public enqueue(resource: PlayableItem | SCNGXTracklist): number {
        const queue = this.queueSubject.getValue();

        // If the item should be enqueued as single
        if(!this.isOfTypeList(resource)) {
            // Enqueue entity
            queue.unshift({ isList: false, data: resource });
            // Register id as enqueued
            this.enqueuedIds.set(resource.id, true);
            // Update queue subject
            this.queueSubject.next(queue);
            return 0;
        }

        // Do not enqueue tracklists twice
        if(this.isEnqueued(resource.id)) return -1;
        // Otherwise set to end of queue and remove previous one
        const index = Math.max(0, queue.length - 1);
        const tracklist = queue[index];
        if(!isNull(tracklist) && tracklist.isList) {
            this.enqueuedIds.delete(tracklist.data?.id);
            (tracklist.data as SCNGXTracklist)?.release();
        }

        queue[index] = { isList: true, data: resource };
        // Register id as enqueued
        this.enqueuedIds.set(resource.id, true);
        // Update queue subject
        this.queueSubject.next(queue);
        return index;
    }

    public dequeue(): EnqueuedItem {
        const queue = this.queueSubject.getValue();
        const next = queue[0];
        if(isNull(next)) return null;

        if(!next.isList) {
            // Remove from registered ids
            this.enqueuedIds.delete(next.data.id);
            // Is a single song, so splice it from queue
            const item = queue.splice(0, 1)?.[0];
            // Update queue subject
            this.queueSubject.next(queue);
            return item;
        }

        const tracklist = next.data as SCNGXTracklist;

        // Check if tracklist has not ended, if true
        // return, otherwise remove from queue
        if(!tracklist.hasEnded) {
            return next;
        }

        // Remove from registered ids
        this.enqueuedIds.delete(tracklist.id);
        // Release tracklist resources
        tracklist.release();
        // Remove from queue
        queue.shift();
        // Update queue subject
        this.queueSubject.next(queue);
        // Return new dequeue attempt
        return this.dequeue();
    }

    /**
     * Clear the queue
     */
    public clear(): Observable<Future<void>> {
        return new Observable((subscriber) => {
            const queue = this.queueSubject.getValue();

            // Push loading state
            subscriber.next(Future.loading());

            // Find tracklist and release
            this.getEnqueuedTracklist()?.release();
            // Remove all items by splicing array
            queue.splice(0, queue.length);
            // Update queue subject
            this.queueSubject.next(queue);

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

    public findById(id: string): EnqueuedItem {
        if(!this.isEnqueued(id)) return null;
        const queue = this.queueSubject.getValue();
        return queue.find((item) => item.data?.id === id);
    }

    public getEnqueuedTracklist(): SCNGXTracklist {
        const queue = this.queueSubject.getValue();
        const item = queue[Math.max(0, queue.length - 1)];
        if(isNull(item) || !item.isList) return null;
        return item.data as SCNGXTracklist;
    }

    public isOfTypeList(item: PlayableItem | SCNGXTracklist): boolean {
        return item.type !== PlayableEntityType.SONG;
    }

    public setShuffled(shuffled: boolean) {
        const tracklist = this.getEnqueuedTracklist();
        console.log("shuffling ", tracklist);
        if(isNull(tracklist)) return;
        
        tracklist.restart(shuffled).subscribe();
    }
    
}