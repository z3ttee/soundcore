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