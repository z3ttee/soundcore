import { BehaviorSubject, Observable } from "rxjs";
import { v4 as uuidv4 } from "uuid";

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

    public hasValue(item: T): boolean {
        const map = this._mapSubject.getValue();
        return Object.values(map).findIndex((i) => i == item) != -1
    }

    public clear() {
        this._mapSubject.next({});
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

    public $items: Observable<T[]> = this._queueSubject.asObservable();
    public $size: Observable<number> = this._sizeSubject.asObservable();

    constructor() {
        
    }
    
    public enqueue(item: T): number {
        const queue = this._queueSubject.getValue();
        queue.push(item);

        this._queueSubject.next(queue);
        this._sizeSubject.next(queue.length);
        return queue.length-1;
    }

    public dequeue(): T {
        const queue = this._queueSubject.getValue();

        console.log("dequeue 1: ", queue.length)
        const item = queue.splice(0, 1)?.[0];

        console.log("dequeue 2: ", queue.length)
        this._queueSubject.next(queue);
        this._sizeSubject.next(queue.length);
        return item;
    }

    public remove(id: string): T {
        const queue = this._queueSubject.getValue();
        const index = queue.findIndex((item) => item["id"] == id);
        if(index == -1) return null;

        const item = queue.splice(index, 1)?.[0];
        this._queueSubject.next(queue);
        this._sizeSubject.next(queue.length);
        return item;
    }

    public peek(): T {
        const queue = this._queueSubject.getValue();
        return queue[0];
    }

    public size(): number {
        return this._queueSubject.getValue().length;
    }

}


export class SCResourceMapQueue<T> {

    private _map: SCResourceMap<T> = new SCResourceMap();
    private _queueMap: SCResourceMap<T> = new SCResourceMap();
    private _queue: SCResourceQueue<T> = new SCResourceQueue();

    public $map = this._map.$map;
    public $queue = this._queue.$items;
    public $size = this._queue.$size;

    constructor() {
        this.$queue.subscribe((items) => {
            console.log(items)
        })
    }

    public enqueue(item: T): number {
        if(!item["id"]) item["id"] = uuidv4();
        this._map.set(item);
        this._queueMap.set(item);
        const position = this._queue.enqueue(item);
        return position;
    }

    public dequeue(): T {
        const next = this._queue.peek();
        this._queueMap.remove(next["id"]);
        this._queue.dequeue();
        return next;
    }

    public remove(id: string): T {
        const item = this._map.remove(id);
        this._queue.remove(id);
        this._queueMap.remove(id);
        return item;
    }

    public has(id: string): boolean {
        return this._map.has(id);
    }

    public isEnqueued(id: string): boolean {
        return this._queueMap.has(id);
    }

    public size(): number {
        return this._queue.size();
    }

}