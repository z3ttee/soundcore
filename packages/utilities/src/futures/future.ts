import { Subject } from "rxjs";
import { isNull } from "../utils";

export class FutureError {
  constructor(
    /**
     * HTTP Status code of the request
     */
    public readonly statusCode: number,
    /**
     * Message provided in the response body
     */
    public readonly message: string,
    /**
     * Native error object
     */
    public readonly errorObj: any
  ) {}
}

export class FutureResponse<TData = any> {
  constructor(
    public readonly data: TData | null,
    public readonly error: FutureError | null
  ) {}
}

export class Future<TData = any> {
  constructor(
    public readonly data: TData | null,
    public readonly loading: boolean,
    public readonly error: FutureError | null,
    protected readonly $retryNotifier?: Subject<void>
  ) {}

  public retry(): void {
    if (isNull(this.$retryNotifier)) return;
    this.$retryNotifier.next();
  }

  public static of<T = any>(data: T | null): Future<T> {
    return new Future<T>(data, false, null);
  }

  public static from<T = any>(response: FutureResponse<T>, $retryNotifier?: Subject<void>): Future<T> {
    return new Future<T>(response.data, false, response.error, $retryNotifier);
  }

  public static empty<T = any>(): Future<T> {
    return new Future<T>(null, false, null);
  }

  public static notfound<T = any>(message?: string, statusCode?: number): Future<T> {
    return this.error<T>(message ?? "Not Found.", statusCode ?? 404);
  }

  public static error<T = any>(message: string, statusCode: number, errorObj?: any): Future<T> {
    return new Future<T>(null, false, new FutureError(statusCode, message, errorObj));
  }

  /**
   * Create empty Future with loading set to true
   * @returns {Future<T>} Future
   */
  public static loading<T = any>(): Future<T> {
    return new Future<T>(null, true, null);
  }

  /**
   * Create a new future by assigning the
   * origin future a new payload value
   * @param origin Original future to update the payload on
   * @param payload Updated payload data
   * @returns {Future<D>} Original Future but with the new payload
   */
  public static assign<TFuture = any, TPayload = any>(origin: Future<TFuture>, payload: TPayload): Future<TPayload> {
    return new Future<TPayload>(payload, origin.loading, origin.error);
  }
}
