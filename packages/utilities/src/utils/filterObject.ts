/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNull } from "./utilities";

/**
 * Filter an object by specific properties
 * @param obj Object to filter
 * @param properties Properties that should be included in the resulting object
 * @returns Resulting object
 */
export function filterObject<T extends object>(obj: T, include: (keyof T)[]): Partial<T> {
  const filteredObj: Partial<T> = {};

  for (const property of include) {
    if (!isNull((obj as any)[property.toString()])) {
      if (typeof (obj as any)[property] === "object" && !Array.isArray((obj as any)[property])) {
        (filteredObj as any)[property] = filterObject(
          (obj as any)[property],
          Object.keys((obj as any)[property])
        ) as T[keyof T];
      } else {
        (filteredObj as any)[property] = (obj as any)[property];
      }
    }
  }

  return filteredObj;
}
