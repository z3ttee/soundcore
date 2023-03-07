import { pascalToSnakeCase } from "@soundcore/common";
import { REFLECT_MEILIINDEX_DISPLAYABLE_ATTRS, REFLECT_MEILIINDEX_FILTERABLE_ATTRS, REFLECT_MEILIINDEX_PROPERTY_NAME, REFLECT_MEILIINDEX_SEARCHABLE_ATTRS, REFLECT_MEILIINDEX_SORTABLE_ATTRS } from "../constants";

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

        const searchableAttrs: string[] = Reflect.getMetadata(REFLECT_MEILIINDEX_SEARCHABLE_ATTRS, constructor) ?? [];
        const filterableAttrs: string[] = Reflect.getMetadata(REFLECT_MEILIINDEX_FILTERABLE_ATTRS, constructor) ?? [];
        const sortableAttrs: string[] = Reflect.getMetadata(REFLECT_MEILIINDEX_SORTABLE_ATTRS, constructor) ?? [];
        const displayableAttrs: string[] = Reflect.getMetadata(REFLECT_MEILIINDEX_DISPLAYABLE_ATTRS, constructor) ?? [];

        if(options?.filterable) filterableAttrs.push(propertyKey.toString());
        if(options?.searchable) searchableAttrs.push(propertyKey.toString());
        if(options?.sortable) sortableAttrs.push(propertyKey.toString());
        if(options?.selectable) displayableAttrs.push(propertyKey.toString());

        if(searchableAttrs.length > 0) Reflect.defineMetadata(REFLECT_MEILIINDEX_SEARCHABLE_ATTRS, searchableAttrs, constructor);
        if(filterableAttrs.length > 0) Reflect.defineMetadata(REFLECT_MEILIINDEX_FILTERABLE_ATTRS, filterableAttrs, constructor);
        if(sortableAttrs.length > 0) Reflect.defineMetadata(REFLECT_MEILIINDEX_SORTABLE_ATTRS, sortableAttrs, constructor);
        if(displayableAttrs.length > 0) Reflect.defineMetadata(REFLECT_MEILIINDEX_DISPLAYABLE_ATTRS, displayableAttrs, constructor);

        Reflect.defineMetadata(REFLECT_MEILIINDEX_PROPERTY_NAME, pascalToSnakeCase(constructor["name"]), constructor, propertyKey);
    };
}