
/**
 * Generate a random string
 * @param {number} length Maximum length of the string. Defaults to 8
 * @param {string} chars String containing all allowed characters that should be used to generate the string.
 * @returns Randomly generated string
 */
export function randomString(length: number = 8, chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
    let str = "";
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
}