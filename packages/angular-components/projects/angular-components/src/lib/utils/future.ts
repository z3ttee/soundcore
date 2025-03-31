import { ApiResponse } from "@repo/angular-sdk";
import { Future } from "@repo/utilities";
import { Observable, Subscriber } from "rxjs";

/**
 * RxJS Operator that transforms an observable providing ApiResponse<T>
 * into a Future<T>
 */
export function toFutureCompat() {
    return function <T>(source: Observable<ApiResponse<T>>) {
        return new Observable((subscriber: Subscriber<Future<T>>) => {
            // Subscribe to source observable
            const sourceSubscription = source.subscribe((response) => {
                // Push new future to subscriber
                subscriber.next({
                    loading: false,
                    data: response.payload,
                    error: {
                        errorObj: response.error,
                        message: response.error?.message,
                        statusCode: response.error?.statusCode,
                    },
                    retry: function (): void {
                        //
                    }
                });
                // Complete subscription as it is completed
                subscriber.complete();
            });

            // Push initial future with loading set to true
            subscriber.next({
                loading: true,
                data: undefined,
                error: undefined,
                retry: function (): void {
                    throw new Error("Function not implemented.");
                }
            });
            // Add subscription of request so it gets unsubscribed if the main sub
            // gets unsubscribed
            subscriber.add(sourceSubscription);
        });
    }
}