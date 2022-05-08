
export class Queue<T> {

    private readonly _queue: T[] = [];

    public get size(): number {
        return this._queue.length;
    }

    public enqueue(item: T): number {
        const index = this._queue.length - 1;
        this._queue[index] = item;
        return index;
    }

    public enqueueAll(item: T[]) {
        this._queue.push(...item);
    }

    public dequeue(): T {
        return this.dequeueAt(0);
    }

    public dequeueAt(index: number): T {
        const item = this._queue.splice(index, 1)?.[0];
        return item;
    }

    public findPosition(item: T): number {
        for(let i = 0; i < this._queue.length; i++) {
            if(item == this._queue[i]) return i;
        }

        return -1;
    }

    public isEmpty(): boolean {
        return this.size <= 0;
    }

}