import { randomString } from "../utils";

export function createSlug(input: string, length: number = 120) {
    if (typeof input === "undefined" || input == null) return input;

    const result = formatSlug(input);
    if (input.length > length) {
        return result.substring(0, length) + "-" + randomString(6);
    } else {
        return result + "-" + randomString(6);
    }
}

export function formatSlug(input: string) {
    if (typeof input === "undefined" || input == null) return input;
    return `${input.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-")}`;
}
