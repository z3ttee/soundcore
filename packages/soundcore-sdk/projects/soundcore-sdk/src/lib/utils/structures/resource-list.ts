import { BehaviorSubject, Observable } from "rxjs";

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