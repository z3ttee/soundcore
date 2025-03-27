import { Request } from "../api";

/**
 * Extract the jwt value from the header value
 * @param headerValue Header value as provided by the AUTHORIZATION header
 * @returns String encoded jwt
 */
export function getTokenFromHeaderValue(headerValue: string | null | undefined): string | null {
  const [type, token] = headerValue?.split(" ") ?? [];
  return type === "Bearer" ? token : null;
}

/**
 * Extract the jwt from the request object
 * @param request Request object
 * @returns String encoded jwt
 */
export function getAccessTokenFromRequest(request: Request): string | null {
  return getTokenFromHeaderValue(request.headers.authorization);
}
