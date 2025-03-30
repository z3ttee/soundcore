import { Injectable } from "@angular/core";
import { isNull } from "@repo/utilities";

export type NGSCookie = {
  key: string;
  value: string;
  path: string;
  expiry?: Date;
};

@Injectable()
export class CookieService {
  /**
   * Set a new cookie value
   * @param {string} key Name of the cookie
   * @param {string} value Value of the cookie
   * @param {number} expiresIn Time in seconds after which the cookie expires
   */
  public set(key: string, value: string | null | undefined, expiresIn?: number): void {
    const cookieProps: string[] = [];

    // Add expiry to cookie
    if (!isNull(expiresIn)) {
      const d = new Date();
      d.setTime(d.getTime() + expiresIn * 1000);
      cookieProps.push(`expires=${d.toUTCString()}`);
    }

    // Add path to cookie
    cookieProps.push(`path=/`);

    // Remove cookie if value is null
    if (isNull(value)) {
      document.cookie = `${key}=;${cookieProps.join(";")}`;
      return;
    }

    // Write formatted cookie
    document.cookie = `${key}=${value};${cookieProps.join(";")}`;
  }

  /**
   * Get a cookie value
   * @param {string} key Name of the cookie
   * @returns {string | undefined} Value of the cookie, or undefined cookie was not found
   */
  public get(key: string): string | undefined {
    const cookieName = `${key}=`;
    const decodedCookieString = decodeURIComponent(document.cookie);

    const cookieParts = decodedCookieString.split(";");
    for (let i = 0; i < cookieParts.length; i++) {
      let part = cookieParts[i];

      while (part.charAt(0) == " ") {
        part = part.substring(1);
      }

      if (part.indexOf(cookieName) == 0) {
        return part.substring(cookieName.length, part.length);
      }
    }

    return undefined;
  }

  /**
   * Get a cookie value or provide default value of cookie does not exist
   * @type {T} Type of the default value. Defaults to `unknown`
   * @param {string} key Name of the cookie
   * @param {T} defaultValue Default value to return when cookie does not exist
   * @returns {string | T} Value of the cookie, or defaultValue if cookie was not found
   */
  public getOrDefault<T = unknown>(key: string, defaultValue: T): string | T {
    const value = this.get(key);
    if (!isNull(value)) return value;
    return defaultValue;
  }

  /**
   * Check if a cookie exists
   * @param {string} key Name of the cookie
   * @returns {boolean} `true`, if the cookie exists. Otherwise returns `false`
   */
  public has(key: string): boolean {
    return !isNull(this.get(key));
  }

  /**
   * Delete a cookie
   * @param key Name of the cookie
   */
  public delete(key: string): void {
    this.set(key, undefined, -999999);
  }
}
