import { BehaviorSubject, Observable, Subject } from "rxjs";

export class Queue<T = any> {

    private _queue: T[] = [];

    private readonly _addedSubject: Subject<void> = new Subject();
    public readonly $onAdded: Observable<void> = this._addedSubject.asObservable();

    private readonly _sizeSubject: BehaviorSubject<number> = new BehaviorSubject(this._queue.length);
    public readonly $size: Observable<number> = this._sizeSubject.asObservable();

    public set(items: T[]) {
        this._queue = items;
        this.notifyAddedItem();
    }

    /**
     * Add item to the top of the queue.
     * This item will be dequeued as next item.
     * @param item Item data to add
     */
    public enqueueTop(item: T) {
        this._queue.unshift(item);
        this.notifyAddedItem();
    }

    /**
     * Add item to the queue.
     * @param item Item data to add
     */
    public enqueue(item: T) {
        this._queue.push(item);
        this.notifyAddedItem();
    }

    /**
     * Dequeue the next item from the queue.
     * @returns Item
     */
    public dequeue(): T {
        return this.dequeueAt(0);
    }

    /**
     * Dequeue item from specific index.
     * @param index Index to dequeue from
     * @returns Item
     */
    public dequeueAt(index: number): T {
        const item = this._queue.splice(index, 1)?.[0];
        this.notifyStateChanged();
        return item;
    }

    /**
     * Dequeue item from random position
     * @returns Item
     */
    public dequeueRandom(): T {
        const index = Math.round(Math.random() * this.size);
        return this.dequeueAt(index);
    }

    /**
     * Get the current size of the queue
     */
    public get size(): number {
        return this._queue.length;
    }

    /**
     * Check if the queue is empty.
     * @returns True or False
     */
    public isEmpty(): boolean {
        return this.size <= 0;
    }

    /**
     * Check if the queue is not empty.
     * @returns True or False
     */
     public isNotEmpty(): boolean {
        return this.size > 0;
    }

    /**
     * Notify subscribed listeners about state changes.
     * This will emit on the addedSubject.
     */
    private notifyAddedItem() {
        this._addedSubject.next();
        this.notifyStateChanged();
    }

    /**
     * Notify all subscribed listeners on size changes.
     */
    private notifyStateChanged() {
        this._sizeSubject.next(this.size);
    }

}