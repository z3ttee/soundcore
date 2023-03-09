import { pascalToSnakeCase } from "@soundcore/common";
import { REFLECT_MEILIINDEX_PROPERTY_NAME } from "../constants";
import { addToAttrs } from "../utils/reflectUtils";

export interface PropertyOptions {
    /**
     * Adds the attribute to the 
     * searchable attributes on the index
     * 
     * @see [Searchable attributes](https://docs.meilisearch.com/reference/api/settings.html#searchable-attributes)
     * @default true
     */
    searchable?: boolean;

    /**
     * Adds the attribute to the 
     * filterable attributes on the index, thus making
     * it possible to filter search entries by this property or
     * perform faceted searches
     * 
     * @see [Filterable attributes](https://docs.meilisearch.com/reference/api/settings.html#filterable-attributes)
     * @default false
     */
    filterable?: boolean;

    /**
     * If true, adds the attribute to returned search
     * results.
     * 
     * @see [Displayed attributes](https://docs.meilisearch.com/reference/api/settings.html#displayed-attributes)
     * @default true
     */
    selectable?: boolean;

    /**
     * Attributes that can be used when sorting search results using the sort search parameter.
     * 
     * @see [Sortable attributes](https://docs.meilisearch.com/reference/api/settings.html#sortable-attributes)
     * @default false
     */
    sortable?: boolean;
}

// export function Property();
export function Property(options?: PropertyOptions) {

    return (target, propertyKey) => {
        const constructor = target.constructor;

        addToAttrs(target, propertyKey, options);
        Reflect.defineMetadata(REFLECT_MEILIINDEX_PROPERTY_NAME, pascalToSnakeCase(constructor["name"]), constructor, propertyKey);
    };
}

