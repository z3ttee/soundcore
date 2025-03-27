import { BehaviorSubject, debounceTime, Observable, Subject, switchMap } from "rxjs";
import { EventCallback } from "./queue/events/events";

export abstract class BaseQueue<T, TEventName> {

    private readonly _debounceSubject: Subject<void> = new Subject();
    private _debounceMs: number = 0;

    /** 
     * Map of registered events. 
     * The event name is used as key and 
     * the callback will be registered on that key
     */
    private readonly _events: Map<TEventName, EventCallback[]> = new Map();

    /** Subject used to add/remove items to/from the queue */
    private readonly _queueSubject: BehaviorSubject<T[]> = new BehaviorSubject([]);

    /** Observable to subscribe to changes to the queue */
    public readonly $queue: Observable<T[]> = this._debounceSubject.asObservable().pipe(
        debounceTime(this._debounceMs ?? 0),
        switchMap(() => this._queueSubject.asObservable())
    );

    /** 
     * Create a new queue instance. 
     * @param debounce Debounce time in milliseconds. Defaults to 0
     */
    constructor(debounce: number = 0) {
        this._debounceMs = debounce;
    }

    /** Get all registered event handlers of an event */
    protected _getHandlersForEvent(eventName: TEventName): EventCallback[] {
        return this._events.get(eventName) || [];
    }

    /** Get current size of the queue */
    public get size(): number {
        return this._queueSubject.getValue().length;
    }

    /** 
     * Set the debounce time in milliseconds. 
     * Setting a debounce adds a delay between 
     * adding an item to the queue and reflecting that change 
     */
    public setDebounceMs(val: number) {
        this._debounceMs = val ?? 0;
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
    public async on<T extends TEventName = never>(eventName: T, callback: EventCallback) {
        const handlers: EventCallback[] = this._events.get(eventName) || [];
        handlers.push(callback);

        this._events.set(eventName, handlers);
    }

    /**
     * Remove a registered event handler.
     * @param eventName Name of the event
     * @param callback Function that was registered
     */
    public async off<T extends TEventName = never>(eventName: T, callback: EventCallback) {
        const handlers: EventCallback[] = this._events.get(eventName) || [];
        const index = handlers.findIndex((val) => val == callback);
        if (index == -1) return;

        handlers.splice(index, 1);
        this._events.set(eventName, handlers);
    }

} 