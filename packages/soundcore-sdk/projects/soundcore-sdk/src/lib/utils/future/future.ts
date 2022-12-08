import { ApiError } from "../error/api-error";

export class Future<T = any> {
    public readonly data?: T;
    public readonly loading: boolean;
    public readonly error?: ApiError;

    public static empty<T = any>(): Future<T> {
        return {
            loading: false,
            data: null,
            error: undefined
        }
    }

    public static notfound<T = any>(message?: string, statusCode?: number, errCode?: string): Future<T> {
        return this.error(message ?? "Not Found.", statusCode ?? 404, errCode ?? "NOT_FOUND");
    }

    public static error<T = any>(message: string, statusCode: number, errCode?: string): Future<T> {
        return {
            loading: false,
            data: undefined,
            error: {
                statusCode: statusCode,
                message: message,
                error: errCode ?? "INTERNAL_CLIENT_ERROR"
            }
        }
    }
}