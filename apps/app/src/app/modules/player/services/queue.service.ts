import { Injectable } from "@angular/core";
import { isNull } from "@soundcore/common";
import { Future, PlayableEntityType } from "@soundcore/sdk";
import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged, map, of, switchMap } from "rxjs";
import { PlayableItem } from "./player.service";
import { SCNGXTracklist } from "../entities/tracklist.entity";

export class EnqueuedItem {
    constructor(
        public isList: boolean,
        public data: PlayableItem | SCNGXTracklist
    ) {}
}

@Injectable({
    providedIn: "root"
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
    private readonly queueSubject: BehaviorSubject<PlayableItem[]> = new BehaviorSubject([]);

    private readonly tracklistSubject: BehaviorSubject<SCNGXTracklist> = new BehaviorSubject(null);
    public readonly $enqueuedTracklist = this.tracklistSubject.asObservable();

    public readonly $queue: Observable<Readonly<[PlayableItem[], SCNGXTracklist]>> = combineLatest([
        this.queueSubject.asObservable(),
        this.tracklistSubject.asObservable().pipe(switchMap((tracklist) => {
            if(isNull(tracklist)) return of(null);
            return tracklist.$queue.pipe(map(() => tracklist));
        })),
    ]);

    /**
     * Add a resource to the queue. Based on the tracklist type,
     * the resource will be added to the beginning or to the end of the queue
     * @param resource Resource to enqueue
     * @returns Position the resource was added to
     */
    public enqueue(resource: PlayableItem | SCNGXTracklist): number {
        const queue = this.queueSubject.getValue();
        const tracklist = this.getEnqueuedTracklist();

        // If the item should be enqueued as single
        if(!this.isOfTypeList(resource)) {
            // Enqueue entity
            queue.unshift(resource as PlayableItem);
            // Register id as enqueued
            this.enqueuedIds.set(resource.id, true);
            // Update queue subject
            this.queueSubject.next(queue);
            return 0;
        }

        // Do not enqueue tracklists twice
        if(tracklist?.id === resource.id) return -1;
        // Register id as enqueued
        this.enqueuedIds.set(resource.id, true);
        // Update tracklist subject
        this.tracklistSubject.next(resource as SCNGXTracklist);
        return Math.max(0, queue.length - 1);
    }

    public dequeue(): EnqueuedItem {
        return this.recursiveDequeue(0);
    }

    private recursiveDequeue(currentDepth?: number): EnqueuedItem {
        // Cancel recursion to not go deeper than 1 loop
        // This was implemented because during development it happened
        // that tracklist were not successfully dequeued, when this got fixed
        // this maximum depth mechanism was introduced for the worst case scenario
        if(currentDepth >= 1) return null;

        const tracklist = this.getEnqueuedTracklist();
        const queue = this.queueSubject.getValue();
        // If there is no tracklist enqueued 
        // or the queue is empty, return null
        if(isNull(tracklist) && queue.length <= 0) return null;
        
        // Check if tracklist is null, or the queue has more than 0 items
        // If true, prioritize queue over tracklist
        if(isNull(tracklist) || queue.length > 0) {
            // Is a single song, so splice it from queue
            const item = queue.splice(0, 1)?.[0];
            // Remove from registered ids
            this.enqueuedIds.delete(item?.id);
            // Update queue subject
            this.queueSubject.next(queue);
            return { isList: false, data: item };
        }

        // Check if tracklist has not ended, if true
        // return, otherwise remove from queue
        if(tracklist.hasEnded) {
            // Remove from registered ids
            this.enqueuedIds.delete(tracklist.id);
            // Release tracklist resources
            tracklist.release();
            // Remove from queue
            queue.shift();
            // Update queue subject
            this.queueSubject.next(queue);
            return this.recursiveDequeue(1);
        }

        return { isList: true, data: tracklist };

        
        // Return new dequeue attempt
        // return this.dequeue();
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
        if(this.getEnqueuedTracklist()?.id === id) return { isList: true, data: this.getEnqueuedTracklist() }
        const queue = this.queueSubject.getValue();
        const item = queue.find((item) => item?.id === id);
        return !isNull(item) ? { isList: false, data: item } : null;
    }

    public getEnqueuedTracklist(): SCNGXTracklist {
        // const queue = this.queueSubject.getValue();
        // const item = queue[Math.max(0, queue.length - 1)];
        // if(isNull(item) || !item.isList) return null;
        // return item.data as SCNGXTracklist;
        return this.tracklistSubject.getValue();
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