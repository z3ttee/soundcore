import { SetMetadata } from "@nestjs/common";

/**
 * Mark a route as public. You can also define,
 * if the authentication should be skipped entirely.
 * @param skipAuth Skip authentication entirely or try to authenticate request. (Can result in @Authentication to be null)
 */
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
