import { Observable, Subscriber } from "rxjs";
import { ApiResponse } from "../responses/api-response";
import { apiResponse } from "../rxjs/operators/api-response";
import { Future } from "./future";

/**
 * RxJS Operator that transforms an observable
 * into a Future<T>
 */
export function toFuture() {
    return function<T>(source: Observable<T>) {
        return new Observable((subscriber: Subscriber<Future<T>>) => {
            // Subscribe to source observable
            const sourceSubscription = source.pipe(apiResponse()).subscribe((response) => {
                // Push new future to subscriber
                subscriber.next({
                    loading: false,
                    data: response.payload,
                    error: response.error
                });
                // Complete subscription as it is completed
                subscriber.complete();
            });

            // Push initial future with loading set to true
            subscriber.next({ loading: true });
            // Add subscription of request so it gets unsubscribed if the main sub
            // gets unsubscribed
            subscriber.add(sourceSubscription);
        });
    }
}

/**
 * RxJS Operator that transforms an observable providing ApiResponse<T>
 * into a Future<T>
 */
export function toFutureCompat() {
    return function<T>(source: Observable<ApiResponse<T>>) {
        return new Observable((subscriber: Subscriber<Future<T>>) => {
            // Subscribe to source observable
            const sourceSubscription = source.subscribe((response) => {
                // Push new future to subscriber
                subscriber.next({
                    loading: false,
                    data: response.payload,
                    error: response.error
                });
                // Complete subscription as it is completed
                subscriber.complete();
            });

            // Push initial future with loading set to true
            subscriber.next({ loading: true });
            // Add subscription of request so it gets unsubscribed if the main sub
            // gets unsubscribed
            subscriber.add(sourceSubscription);
        });
    }
}