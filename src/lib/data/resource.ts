import { BehaviorSubject, Observable, Subject } from "rxjs";
import { v4 as uuidv4 } from "uuid";

export interface SCQueuePeekResult<T> {

    item?: T;
    position?: number;

}

/**
 * Basic Map datastructure.
 * Support operations like add, remove and has.
 * This class makes use of some reactive approaches and comes
 * with an observables, $map , to get "real time" updates.
 */
export class SCResourceMap<T> {

    private _mapSubject: BehaviorSubject<Record<string, T>> = new BehaviorSubject({});
    public $map: Observable<Record<string, T>> = this._mapSubject.asObservable();

    public set(item: T): T {
        if(!item["id"]) item["id"] = uuidv4();
        const map = this._mapSubject.getValue();
        map[item["id"]] = item;
        this._mapSubject.next(map);
        return item;
    }

    public remove(id: string): T {
        const map = this._mapSubject.getValue();
        const item = map[id];
        delete map[id];

        this._mapSubject.next(map);
        return item;
    }

    public has(id: string): boolean {
        const map = this._mapSubject.getValue();
        return !!map[id];
    }

    public get(id: string): T {
        const map = this._mapSubject.getValue();
        return map[id];
    }

    public hasValue(item: T): boolean {
        const map = this._mapSubject.getValue();
        return Object.values(map).findIndex((i) => i == item) != -1
    }

    public clear() {
        this._mapSubject.next({});
    }

    public items() {
        const map = this._mapSubject.getValue();
        const values: T[] = [];
        for(const key in map) {
            values.push(map[key])
        }
        return values;
    }

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

/**
 * SCResourceMapQueue contains two datastructures. One is a map and the other one is a queue.
 * The map is used to contain all available data at anytime, whereas the queue only contains data
 * that has not yet been dequeued.
 */
export class SCResourceMapQueue<T> {
    private _map: SCResourceMap<T> = new SCResourceMap();
    private _queueMap: SCResourceMap<T> = new SCResourceMap();
    private _queue: SCResourceQueue<T> = new SCResourceQueue();

    public $map = this._map.$map;
    public $queue = this._queue.$items;
    public $size = this._queue.$size;

    public items(): T[] {
        return this._map.items();
    }

    /**
     * Enqueue an item. The item will also be added to the internal map
     * until it is removed.
     * @param item Item to add
     * @returns Position in Queue as number
     */
    public enqueue(item: T): number {
        if(!item["id"]) item["id"] = uuidv4();
        this.set(item);
        this._queueMap.set(item);
        const position = this._queue.enqueue(item);
        return position;
    }

    /**
     * Dequeue an item. The outcome will also be defined by the current value in the isShuffled subject
     * that was passed to the constructor.
     * NOTE: This will not remove the item from the internal map.
     * @returns Item
     */
    public async dequeue(random: boolean = false): Promise<T> {
        // Peek next element to check if there is any item left.
        const peek = await this._queue.peek(random)
        if(!peek || !peek.item) return null;

        // Dequeue the peeked item.
        this._queueMap.remove(peek.item["id"]);
        const item = await this._queue.dequeuePosition(peek.position);

        return this.get(item["id"]);
    }

    /**
     * Dequeue an item by its id
     * @param itemId ID of the item
     * @returns Item
     */
    public async dequeueId(itemId: string): Promise<T> {
        this._queueMap.remove(itemId);
        this._queue.remove(itemId);
        return this.get(itemId);
    }

    /**
     * Remove an item from the internal map. This will also remove the item
     * from the queue, if it was enqueued before.
     * @param id ID of the item
     * @returns Item
     */
    public remove(id: string): T {
        const item = this._map.remove(id);
        this._queue.remove(id);
        this._queueMap.remove(id);
        return item;
    }

    /**
     * Check if an item by an id is in the queue
     * @param id ID of the item
     * @returns True or False
     */
    public isEnqueued(id: string): boolean {
        return this._queueMap.has(id);
    }

    /**
     * Get size of the queue.
     * NOTE: This does not include the actual size of the resource map.
     * @returns Size as number
     */
    public size(): number {
        return this._queue.size();
    }

    /**
     * Add or update a value in the internal map.
     * @param item Item to add/Update
     * @returns Item
     */
    public set(item: T): T {
        return this._map.set(item)
    }

    /**
     * Check if the map already contains an object with that id.
     * @param id ID to check
     * @returns True or False
     */
    public has(id: string): boolean {
        return this._map.has(id);
    }

    /**
     * Get an item by its id.
     * @param itemId Item id to lookup
     * @returns Item
     */
    public get(itemId: string): T {
        return this._map.get(itemId)
    }

}



export class SCResourceList<T> {

    private _itemsSubject: BehaviorSubject<T[]> = new BehaviorSubject([]);
    public $items: Observable<T[]> = this._itemsSubject.asObservable();

    constructor() {}

    public add(item: T) {
        const items = this._itemsSubject.getValue();
        items.push(item);
        this._itemsSubject.next(items);
    }

    public addBulk(batch: T[]) {
        const items = this._itemsSubject.getValue();
        items.push(...batch);
        this._itemsSubject.next(items);
    }

    public addAt(index: number, item: T) {
        const items = this._itemsSubject.getValue();

        // Split the array. This will take all items before the specified index.
        const topPart = items.slice(0, index);

        // Now push the item to the first part.
        topPart.push(item);

        // Merge both arrays back together and push changes
        this._itemsSubject.next([
            ...topPart,
            ...items
        ]);
    }

    public remove(item: T): T {
        const items = this._itemsSubject.getValue();
        const index = items.findIndex((i) => i == item);
        if(index == -1) return null;
        return this.removeAt(index);
    }

    public removeAt(index: number): T {
        const items = this._itemsSubject.getValue();
        const item = items.splice(index, 1)?.[0];
        this._itemsSubject.next(items);
        return item;
    }

}