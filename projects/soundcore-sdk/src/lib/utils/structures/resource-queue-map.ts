import { SCResourceMap } from "../structures/resource-map";
import { SCResourceQueue } from "../structures/resource-queue";
import { v4 as uuidv4 } from "uuid";

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