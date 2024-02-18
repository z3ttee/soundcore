import { ApiError } from "../error/api-error";

export class Future<T = any> {

    constructor(
        public readonly data?: T,
        public readonly loading: boolean = false,
        public readonly error?: ApiError
    ) {}

    public static of<T = any>(data?: T): Future<T> {
        return new Future<T>(data, false, undefined);
    }

    public static empty<T = any>(): Future<T> {
        return new Future<T>(null, false, undefined);
    }

    public static notfound<T = any>(message?: string, statusCode?: number, errCode?: string): Future<T> {
        return this.error(message ?? "Not Found.", statusCode ?? 404, errCode ?? "NOT_FOUND");
    }

    public static error<T = any>(message: string, statusCode: number, errCode?: string): Future<T> {
        return new Future<T>(null, false, {
            statusCode: statusCode,
            message: message,
            error: errCode ?? "INTERNAL_CLIENT_ERROR"
        });
    }

    public static loading<T = any>(): Future<T> {
        return new Future<T>(undefined, true, undefined);
    }

    public static merge<D = any>(dst: Future<D>, src: D): Future<D> {
        return new Future<D>({
            ...dst.data ?? {} as D,
            ...src ?? {} as D
        }, dst.loading, dst.error);
    }
}