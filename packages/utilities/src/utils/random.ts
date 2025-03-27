/**
 * Generate a random string
 * @param {number} length Maximum length of the string. Defaults to 8
 * @param {string} chars String containing all allowed characters that should be used to generate the string. Defaults to ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#!.-,?+*
 * @returns Randomly generated string
 */
export function randomString(
  length = 8,
  chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#!.-,?+*"
): string {
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

/**
 * Return a random integer
 * @param digits Amount of digits the integer should have. Defaults to 6
 * @returns Randomly generated integer
 */
export function randomInt(digits = 6): number {
  const number = Array.from({ length: digits }).map((_, i) => {
    // Get random digit between 0-9
    const rnd = Math.random() * 9;

    // If its first digit (left side), return non-zero value
    if (i === 0) return Math.round(Math.floor(rnd) + 1);
    // Otherwise return random
    return Math.round(rnd);
  });
  return Number(number.join(""));
}
