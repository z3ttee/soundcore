import { Logger } from "@nestjs/common";
import { isUndefined } from "@soundcore/common";
import { REFLECT_MEILIINDEX_ATTRIBUTES, REFLECT_MEILIINDEX_OPTIONS, REFLECT_MEILIINDEX_RELATIONS } from "../constants";
import { IndexOptions } from "../decorators/meilisearch.decorator";
import { IndexSchema } from "../definitions";
import { IndexAttribute, IndexAttributeRelation } from "../entities/index-attr.entity";

export function getSchemaRelations(schema: IndexSchema): Map<string, IndexAttributeRelation> {
    return Reflect.getMetadata(REFLECT_MEILIINDEX_RELATIONS, schema) ?? new Map();
}

export function setSchemaRelations(schema: IndexSchema, attrs: Map<string, IndexAttributeRelation>) {
    Reflect.defineMetadata(REFLECT_MEILIINDEX_RELATIONS, attrs, schema);
}

export function addSchemaRelation(schema: IndexSchema, relation: IndexAttributeRelation) {
    const attrs = getSchemaRelations(schema);
    if(attrs.has(relation.attrName)) return;
    attrs.set(relation.attrName, relation);
    setSchemaRelations(schema, attrs);
}

export function getSchemaAttributes(schema: IndexSchema): Map<string, IndexAttribute> {
    return Reflect.getMetadata(REFLECT_MEILIINDEX_ATTRIBUTES, schema) ?? new Map();
}

export function setSchemaAttributes(schema: IndexSchema, attrs: Map<string, IndexAttribute>) {
    Reflect.defineMetadata(REFLECT_MEILIINDEX_ATTRIBUTES, attrs, schema);
}

export function addSchemaAttribute(schema: IndexSchema, attr: IndexAttribute) {
    const attrs = getSchemaAttributes(schema);
    if(attrs.has(attr.attrName)) return;
    attrs.set(attr.attrName, attr);
    setSchemaAttributes(schema, attrs);
}

export function getPrimaryAttribute(schema: IndexSchema): IndexAttribute {
    const attrs = getSchemaAttributes(schema);
    return Array.from(attrs.values()).find((attr) => attr.isPrimary);
}

export function getRelationOfAttr(schema: IndexSchema, propertyKey: string): IndexAttributeRelation {
    const attrs = getSchemaRelations(schema);
    return Array.from(attrs.values()).find((attr) => attr.attrName === propertyKey);
}

export function setIndexOptions(schema: IndexSchema, options: IndexOptions) {
    Reflect.defineMetadata(REFLECT_MEILIINDEX_OPTIONS, options, schema)
}

export function getIndexOptions(schema: IndexSchema): IndexOptions {
    return Reflect.getOwnMetadata(REFLECT_MEILIINDEX_OPTIONS, schema)
}

export function getAllSchemaAttributes(schema: IndexSchema, logger?: Logger): Map<string, IndexAttribute> {
    const attrs = new Map(getSchemaAttributes(schema));
    
    for(const relation of getSchemaRelations(schema).values()) {
        const relationSchema = relation.relationSchema;
        if(isUndefined(relationSchema)) {
          logger?.warn(`Cannot find schema for relation '${relation.attrName}' (${relation.type}). Did you forget to decorate the relation-class-type using @MeiliIndex()?`);
          continue;
        }

        const relationAttrs = getSchemaAttributes(relationSchema);
        for(const attr of relationAttrs.values()) {
            const attrCopy: IndexAttribute = {
                ...attr,
                isPrimary: false,
                attrName: `${relation.attrName}.${attr.attrName}`
            }
            attrs.set(`${relation.attrName}.${attr.attrName}`, attrCopy);
        }
    }

    return attrs;
}