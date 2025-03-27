import { isNull } from "./utilities";

/**
 * Convert an object to an url search params string.
 * Note: Nested objects will be appended as json string
 * @param obj Target object that should be transformed
 * @returns URLSearchparams string
 */
export function objectToSearchParams(obj: any | null | undefined): string {
    if (isNull(obj)) return "";

    const params = new URLSearchParams();
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === "object") {
                params.append(key, JSON.stringify(obj[key]));
            } else {
                if (typeof obj[key] === "undefined" || obj[key] == null) continue;
                params.append(key, obj[key]);
            }
        }
    }

    return params.toString();
}