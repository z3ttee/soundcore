import { REFLECT_MEILIINDEX_RELATION_HAS_MANY } from "../constants";
import { Class } from "../definitions";
import { addToAttrs } from "../utils/reflectUtils";
import { PropertyOptions } from "./property.decorator";

/**
 * Define a list of nested objects.
 * @param type Type of each element in the list
 */
export function HasMany<T>(type: Class<T>, options?: PropertyOptions) {
    return (target, propertyKey) => {
        const constructor = target.constructor;
        Reflect.defineMetadata(REFLECT_MEILIINDEX_RELATION_HAS_MANY, type, constructor, propertyKey);
        addToAttrs(target, propertyKey, options);
    };
}