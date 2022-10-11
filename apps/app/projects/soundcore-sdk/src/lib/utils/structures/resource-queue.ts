import { BehaviorSubject, Observable, Subject } from "rxjs";

export interface SCQueuePeekResult<T> {
    item?: T;
    position?: number;
}

/**
 * Basic Queue datastructure.
 * Support operations like enqueue, dequeue and peek.
 * This class makes use of some reactive approaches and comes
 * with some exposed observables, like $items and $size, to get "real time"
 * updates.
 */
 export class SCResourceQueue<T> {
    // TODO: Add random setting (shuffle as observable for reactive changing this option)

    private _queueSubject: BehaviorSubject<T[]> = new BehaviorSubject([]);
    private _sizeSubject: BehaviorSubject<number> = new BehaviorSubject(0);
    private _onQueueWaiting: Subject<void> = new Subject();

    public $items: Observable<T[]> = this._queueSubject.asObservable();
    public $size: Observable<number> = this._sizeSubject.asObservable();
    public $onQueueWaiting: Observable<void> = this._onQueueWaiting.asObservable();
    
    /**
     * Add items to the queue.
     * @param item Item to enqueue.
     * @returns Position in queue as number
     */
    public enqueue(item: T): number {
        const queue = this._queueSubject.getValue();
        queue.push(item);

        this._queueSubject.next(queue);
        this._sizeSubject.next(queue.length);
        this._onQueueWaiting.next();
        return queue.length-1;
    }

    /**
     * Enqueue items to the top of the queue (position 0).
     * This causes the item to be executed next.
     * @param item Item to enqueue.
     * @returns Position in queue as number
     */
    public enqueueTop(item: T): number {
        const queue = this._queueSubject.getValue();
        queue.unshift(item);

        this._queueSubject.next(queue);
        this._sizeSubject.next(queue.length);
        return 0;
    }

    /**
     * Dequeue the next item. This removes the item from the queue.
     * @returns Item object
     */
    public async dequeue(random: boolean = false): Promise<T> {
        const index = this.getIndex(random);
        return this.dequeuePosition(index);
    }

    public async dequeuePosition(position: number): Promise<T> {
        const queue = this._queueSubject.getValue();
        const item: T = queue.splice(position, 1)?.[0];

        this._queueSubject.next(queue);
        this._sizeSubject.next(queue.length);
        return item;
    }

    /**
     * Remove an item from the queue by its id.
     * It is not recommended to remove items from the queue, as this has a complexity of O(n).
     * NOTE: The item must be an object with a valid id property.
     * @param id ID of the object.
     * @returns Removed item object.
     */
    public remove(id: string): T {
        const queue = this._queueSubject.getValue();
        const index = queue.findIndex((item) => item["id"] == id);
        if(index == -1) return null;

        const item = queue.splice(index, 1)?.[0];
        this._queueSubject.next(queue);
        this._sizeSubject.next(queue.length);
        return item;
    }

    /**
     * Get the next element from the queue without removing it.
     * NOTE: If isShuffled=true, the next random element will be taken.
     * @returns Item object
     */
    public peek(random: boolean = false): SCQueuePeekResult<T> {
        const index = this.getIndex(random);
        const queue = this._queueSubject.getValue();

        return {
            item: queue[index],
            position: index
        };
    }

    /**
     * Get the current size of the queue.
     * @returns Size as number
     */
    public size(): number {
        return this._queueSubject.getValue().length;
    }

    /**
     * Get the current list of items in the queue.
     * @returns Items array
     */
    public items(): T[] {
        return this._queueSubject.getValue();
    }

    private getIndex(random: boolean = false): number {
        if(random) return Math.floor(Math.random() * this.size());
        return 0;
    }

}