export class QueueItem<T> {

    constructor(
        public readonly id: string | number,
        public data: T
    ) {}

}

export class Queue<T> {

    private readonly _queue: QueueItem<T>[] = [];

    public get size(): number {
        return this._queue.length;
    }

    public enqueue(id: string | number, item: T): number {
        const index = this._queue.length - 1;
        this._queue[index] = new QueueItem(id, item);
        return index;
    }

    public dequeue(): QueueItem<T> {
        return this.dequeueAt(0);
    }

    public dequeueAt(index: number): QueueItem<T> {
        const item = this._queue.splice(index, 1)?.[0];
        return item;
    }

    public findPosition(itemId: string | number): number {
        for(let i = 0; i < this._queue.length; i++) {
            if(itemId == this._queue[i]?.id) return i;
        }

        return -1;
    }

    public isEmpty(): boolean {
        return this.size <= 0;
    }

}