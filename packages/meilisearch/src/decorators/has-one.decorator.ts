import { IndexSchemaResolver } from "../definitions";
import { IndexAttributeRelation } from "../entities/index-attr.entity";
import { addSchemaRelation } from "../utils/reflectUtils";

/**
 * Define a nested object.
 * @param type Type of the object
 */
export function MeilisearchHasOne(typeResolver: IndexSchemaResolver) {
    return (target, propertyKey) => {
        addSchemaRelation(target.constructor, new IndexAttributeRelation(propertyKey, "one", typeResolver))
    };
}