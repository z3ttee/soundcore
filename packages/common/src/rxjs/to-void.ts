import { map, Observable, Subscriber } from "rxjs";

/**
 * RxJS pipe operator to transform any
 * observable to return <void>
 */
export function toVoid() {
    return function<T>(source: Observable<T>) {
        return source.pipe(map(() => {
            /** Return nothing to make it void */
        }));
    }
}