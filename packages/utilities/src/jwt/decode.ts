import { isNull } from "../utils";

/**
 * Decode a BASE64 encoded jwt
 * @param token JWT string
 * @returns Decoded token object or null if decoding failed
 */
export function decodeJwt<T = unknown>(token: string | undefined | null): T | null {
  if (isNull(token)) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload) as T;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Cannot decode token: ${err.message}`);
    }
    throw new Error(`Cannot decode token: ${err}`);
  }
}
