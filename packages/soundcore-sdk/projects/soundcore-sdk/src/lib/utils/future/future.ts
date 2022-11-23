import { ApiError } from "../error/api-error";

export interface Future<T = any> {
    data?: T;
    loading: boolean;
    error?: ApiError;
}