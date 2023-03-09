import { REFLECT_MEILIINDEX_RELATION_HAS_ONE } from "../constants";
import { Class } from "../definitions";
import { addToAttrs } from "../utils/reflectUtils";
import { PropertyOptions } from "./property.decorator";

/**
 * Define a nested object.
 * @param type Type of the object
 */
export function HasOne<T>(type: Class<T>, options?: PropertyOptions) {
    return (target, propertyKey) => {

        const constructor = target.constructor;
        Reflect.defineMetadata(REFLECT_MEILIINDEX_RELATION_HAS_ONE, type, constructor, propertyKey);

        addToAttrs(target, propertyKey, options);
    };
}