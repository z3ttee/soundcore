/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable, Subject, Subscriber, catchError, map, of, retry } from "rxjs";
import { isNull } from "../utils";
import { Future, FutureError, FutureResponse } from "./future";

type ToFutureFn<T> = (source: Observable<T>) => Observable<Future<T>>;

/**
 * RxJS Operator that transforms an observable
 * into a Future<T>
 */
function toFuture<T = any>(): ToFutureFn<T>;
/**
 * RxJS Operator that transforms an observable
 * into a Future<T>
 * @param retries Amount of retries before future fails
 */
function toFuture<T = any>(retries: number): ToFutureFn<T>;
/**
 * RxJS Operator that transforms an observable
 * into a Future<T>
 * @param $retryNotifier Subject that can be subscribed to which can then be used to inform the future to retry the request
 */
function toFuture<T = any>($retryNotifier: Subject<void>): ToFutureFn<T>;
function toFuture<T = any>(retriesOrNotifier?: number | Subject<void>): ToFutureFn<T> {
  return function <T>(source: Observable<T>): Observable<Future<T>> {
    return new Observable((subscriber: Subscriber<Future<T>>) => {
      let retryableObservable: Observable<T> = source;
      if (typeof retriesOrNotifier === "number") {
        // Register retries as number
        retryableObservable = source.pipe(retry(Math.max(0, retriesOrNotifier)));
      } else if (typeof retriesOrNotifier === "object") {
        // Register a notifier to control retrys via subject
        retryableObservable = source.pipe(retry({ delay: () => retriesOrNotifier }));
      }

      // Subscribe to source observable
      const subscription = retryableObservable
        .pipe(
          // Catch http errors
          catchError((err) => {
            // Return new observable emitting the error
            return of(err);
          }),
          // Map the result. This can either be an
          // error response or valid payload
          map((result: any) => {
            // When the result has an error object,
            // it most likely is an angular error response
            // from the http client.
            if (!isNull(result?.["error"])) {
              return new FutureResponse<T>(
                null,
                new FutureError(
                  Number(result.error?.statusCode ?? 500),
                  String(result.error?.["message"] ?? "InternalClientError"),
                  result
                )
              );
            }

            // Otherwise wrap payload into a future response
            return new FutureResponse<T>(result, null);
          })
        )
        .subscribe((response) => {
          // Push new future to subscriber
          subscriber.next(Future.from(response));
          // Complete subscription as it is completed
          subscriber.complete();
        });

      // Push initial future with loading set to true
      subscriber.next(Future.loading());
      // Add subscription of request so it gets unsubscribed if the main sub
      // gets unsubscribed
      subscriber.add(subscription);
    });
  };
}

export { toFuture };
