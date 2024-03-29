import { BehaviorSubject, debounceTime, Observable, Subject, switchMap } from "rxjs";
import { EventCallback } from "../queue/events/events";

export abstract class BaseQueue<T, EN> {

    private readonly _events: Map<EN, EventCallback[]> = new Map();
    private _debounceMs: number = 0;

    private readonly _debounceSubject: Subject<void> = new Subject();
    private readonly _queueSubject: BehaviorSubject<T[]> = new BehaviorSubject([]);
    protected readonly $queue: Observable<T[]> = this._debounceSubject.asObservable().pipe(
        debounceTime(this.debounceMs || 0),
        switchMap(() => this._queueSubject.asObservable())
    );

    constructor(_debounceMs: number = 0) {
        this._debounceMs = _debounceMs;
    }

    protected get debounceMs(): number {
        return this._debounceMs;
    }

    protected get eventRegistry(): Map<EN, EventCallback[]> {
        return this._events;
    }

    protected getHandlersForEvent(eventName: EN): EventCallback[] {
        return this._events.get(eventName) || [];
    }

    public get size(): number {
        return this._queueSubject.getValue().length;
    }

    public setDebounceMs(val: number) {
        if(!val) val = 0;
        this._debounceMs = val;
    }

    /**
     * Add a new item to the queue
     * @param item Item to add
     * @returns Position in queue (beginning at 0)
     */
     public async enqueue(item: T): Promise<number> {
        const queue = this._queueSubject.getValue();
        const position = queue.push(item);

        this._queueSubject.next(queue);
        this._debounceSubject.next();
        return position;
    }

    /**
     * Get next item from queue. Returns null if 
     * queue is empty.
     * @returns Item
     */
    public async dequeue(): Promise<T> {
        const queue = this._queueSubject.getValue();
        const item = queue.splice(0, 1)?.[0];

        this._queueSubject.next(queue);
        return item;
    }

    /**
     * Peek the next item of the queue
     * @returns Item or null if queue is empty
     */
    public peek(): T {
        const queue = this._queueSubject.getValue();
        return queue[0];
    }

    /**
     * Register queue event listener.
     * @param eventName Name of the event
     * @param callback Event handler callback
     */
    public async on<T extends EN>(eventName: T, callback: EventCallback) {
        const handlers: EventCallback[] = this._events.get(eventName) || [];
        handlers.push(callback);

        this._events.set(eventName, handlers);
    }

    public async off<T extends EN>(eventName: T, callback: EventCallback) {
        const handlers: EventCallback[] = this._events.get(eventName) || [];
        const index = handlers.findIndex((val) => val == callback);
        if(index == -1) return;

        handlers.splice(index, 1);
        this._events.set(eventName, handlers);
    }

} 