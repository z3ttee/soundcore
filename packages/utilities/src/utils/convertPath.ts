/**
 * Convert file paths with backslashes ("\") to paths using
 * slashes ("/")
 * @param input Input path
 * @returns Path with replaces path separators
 */
export function pathToUrlStyle(input: string): string {
  return input.replace(/\\/g, "/");
}
