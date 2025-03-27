/**
 * Check if an object is undefined.
 * This checks: typeof target === "undefined"
 * @param target Target to check if undefined
 * @returns True if undefined, otherwise false
 */
export function isUndefined<T = unknown>(target: T | undefined | null): target is undefined {
  return typeof target === "undefined";
}

/**
 * Check if an object is undefined or null.
 * Underlying check: isUndefined(target) || target == null
 * @param target Target to check if undefined or null
 * @returns True if undefined or null, otherwise false
 */
export function isNull<T = unknown>(target: T | undefined | null): target is null | undefined {
  return isUndefined(target) || target == null;
}

/**
 * Check if an object is a string.
 * Checks if the object is not null and type is of string
 * @param target Target to check if is a string
 * @returns True if its a string, otherwise false
 */
export function isString<T = unknown>(target: T | undefined | null): boolean {
  return !isNull(target) && typeof target === "string";
}

/**
 * Transform a pascal-cased string to snake-cased string
 * @param input String input
 * @returns Snake-Cased string
 */
export function pascalToSnakeCase(input: string): string {
  return input
    ?.split(/\.?(?=[A-Z])/)
    ?.join("_")
    ?.toLowerCase();
}

/**
 * Check if a property key exists on an object
 * @param obj Object to check for property key
 * @param propertyKey Property key
 * @returns True if the property key exists on the object, otherwise false
 */
export function hasProperty<T = unknown>(obj: T, propertyKey: keyof T): boolean {
  return !isUndefined(obj[propertyKey]);
}

/**
 * check if string is a event
 * @param input string to prove
 * @returns event or undefined
 */
// export function stringToNGSEventState(input: string): NGSEventState | undefined {
//   const enumValues = Object.values(NGSEventState) as string[];

//   // Prüfe, ob der gegebene Eingabestring in den Enum-Werten enthalten ist
//   if (enumValues.includes(input)) {
//     return input as NGSEventState;
//   }

//   return undefined; // Oder handle den Fehlerfall entsprechend
// }
