import { IndexSchemaResolver } from "../definitions";
import { IndexAttributeRelation } from "../entities/index-attr.entity";
import { addSchemaRelation } from "../utils/reflectUtils";

/**
 * Define a list of nested objects.
 * @param type Type of each element in the list
 */
export function MeilisearchHasMany(typeResolver: IndexSchemaResolver) {
    return (target, propertyKey) => {
        addSchemaRelation(target.constructor, new IndexAttributeRelation(propertyKey, "many", typeResolver))
    };
}