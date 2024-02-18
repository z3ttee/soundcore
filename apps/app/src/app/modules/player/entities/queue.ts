import { BehaviorSubject } from "rxjs";
import { isNull } from "@soundcore/common";

export class Queue<T = any> {

    private readonly queue: BehaviorSubject<T[]> = new BehaviorSubject([]);
    public readonly $items = this.queue.asObservable();

    private _lastDequeuedItem: T;
    private _initialized: boolean = false;

    public get items() {
        return this.queue.getValue();
    }

    public get size() {
        return this.items.length;
    }

    public get lastDequeuedItem() {
        return this._lastDequeuedItem;
    }

    public enqueue(items: T[]) {
        const queue = this.queue.getValue();
        queue.push(...items);
        this.queue.next(queue);
        this._initialized = true;
    }

    public dequeue() {
        const queue = this.queue.getValue();
        const item = queue.shift();
        this.queue.next(queue);
        if(!isNull(item)) this._lastDequeuedItem = item;
        return item;
    }

    public clearIfInitialized() {
        if(!this._initialized) return;
        this.queue.next([]);
    }

    public release() {
        this.clearIfInitialized();
        this.queue.complete();
    }

}