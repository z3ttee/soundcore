import { REFLECT_MEILIINDEX_DISPLAYABLE_ATTRS, REFLECT_MEILIINDEX_FILTERABLE_ATTRS, REFLECT_MEILIINDEX_INCLUDED_PROPS, REFLECT_MEILIINDEX_OPTIONS, REFLECT_MEILIINDEX_SEARCHABLE_ATTRS, REFLECT_MEILIINDEX_SORTABLE_ATTRS } from "../constants";
import { IndexOptions } from "../decorators/index.decorator";
import { PropertyOptions } from "../decorators/property.decorator";
import { IndexSchema } from "../definitions";

export function copyMetadataToParent(parentTarget, subTarget) {
    console.log(Reflect.getMetadataKeys(parentTarget));

    // console.log(Reflect.getMetadataKeys(subTarget));

    const parentOptions: IndexOptions = Reflect.getOwnMetadata(REFLECT_MEILIINDEX_OPTIONS, parentTarget) ?? {};

    console.log(parentTarget, parentOptions);

    const searchableAttributesSub: string[] = Reflect.getMetadata(REFLECT_MEILIINDEX_SEARCHABLE_ATTRS, subTarget) ?? [];
    const searchableAttributesParent: string[] = Reflect.getMetadata(REFLECT_MEILIINDEX_SEARCHABLE_ATTRS, parentTarget) ?? [];


    console.log(searchableAttributesSub, "+", searchableAttributesParent);
}

export function getSearchableAttributes(schema: IndexSchema): string[] {
    return Reflect.getMetadata(REFLECT_MEILIINDEX_SEARCHABLE_ATTRS, schema) ?? [];
}

export function getDisplayableAttributes(schema: IndexSchema): string[] {
    return Reflect.getMetadata(REFLECT_MEILIINDEX_DISPLAYABLE_ATTRS, schema) ?? [];
}

export function getFilterableAttributes(schema: IndexSchema): string[] {
    return Reflect.getMetadata(REFLECT_MEILIINDEX_FILTERABLE_ATTRS, schema) ?? [];
}

export function getSortableAttributes(schema: IndexSchema): string[] {
    return Reflect.getMetadata(REFLECT_MEILIINDEX_SORTABLE_ATTRS, schema) ?? [];
}

export function getIncludedAttrs(schema: IndexSchema): string[] {
    return Reflect.getMetadata(REFLECT_MEILIINDEX_INCLUDED_PROPS, schema) ?? [];
}

function define(key: string, attrs: string[], schema: IndexSchema) {
    Reflect.defineMetadata(key, attrs, schema);
}

export function setSearchableAttrs(schema: IndexSchema, attrs: string[]) {
    define(REFLECT_MEILIINDEX_SEARCHABLE_ATTRS, attrs, schema);
}

export function setDisplayableAttrs(schema: IndexSchema, attrs: string[]) {
    define(REFLECT_MEILIINDEX_DISPLAYABLE_ATTRS, attrs, schema);
}

export function setFilterableAttrs(schema: IndexSchema, attrs: string[]) {
    define(REFLECT_MEILIINDEX_FILTERABLE_ATTRS, attrs, schema);
}

export function setSortableAttrs(schema: IndexSchema, attrs: string[]) {
    define(REFLECT_MEILIINDEX_SORTABLE_ATTRS, attrs, schema);
}

export function setIncludedAttrs(schema: IndexSchema, attrs: string[]) {
    define(REFLECT_MEILIINDEX_INCLUDED_PROPS, attrs, schema);
}

export function addSearchableAttr(schema: IndexSchema, property: string) {
    const attrs = getSearchableAttributes(schema);
    attrs.push(property);
    setSearchableAttrs(schema, attrs);
}

export function addFilterableAttr(schema: IndexSchema, property: string) {
    const attrs = getFilterableAttributes(schema);
    attrs.push(property);
    setFilterableAttrs(schema, attrs);
}

export function addSortableAttr(schema: IndexSchema, property: string) {
    const attrs = getSortableAttributes(schema);
    attrs.push(property);
    setSortableAttrs(schema, attrs);
}

export function addDisplayableAttr(schema: IndexSchema, property: string) {
    const attrs = getDisplayableAttributes(schema);
    attrs.push(property);
    setDisplayableAttrs(schema, attrs);
}

export function addIncludedAttrs(schema: IndexSchema, property: string) {
    const attrs = getIncludedAttrs(schema);
    attrs.push(property);
    setIncludedAttrs(schema, attrs);
}

export function addToAttrs(target, propertyKey, options?: PropertyOptions) {
    const constructor = target.constructor;

    if(options?.filterable) addFilterableAttr(constructor, propertyKey.toString());
    if((options?.searchable ?? true)) addSearchableAttr(constructor, propertyKey.toString());
    if(options?.sortable) addSortableAttr(constructor, propertyKey.toString());
    if((options?.selectable ?? true)) addDisplayableAttr(constructor, propertyKey.toString());
    addIncludedAttrs(constructor, propertyKey.toString());
}