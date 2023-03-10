import { isUndefined } from "@soundcore/common";
import { AccessorDecorator } from "../definitions";
import { IndexAttribute } from "../entities/index-attr.entity";
import { addSchemaAttribute } from "../utils/reflectUtils";
import { PropertyOptions } from "./property.decorator";

export interface PrimaryKeyOptions extends PropertyOptions {
    name?: string;
}

export function MeilisearchPK();
export function MeilisearchPK(name: string);
export function MeilisearchPK(options: PrimaryKeyOptions);
export function MeilisearchPK(keyOrOptions?: string | PrimaryKeyOptions): AccessorDecorator {
    let keyName;
    let options: PropertyOptions;

    if(!isUndefined(keyOrOptions)) {
        if(typeof keyOrOptions === "string") {
            keyName = keyOrOptions;
        } else {
            keyName = keyOrOptions.name;
            options = keyOrOptions;
        }
    }

    return (target, propertyKey) => {
        addSchemaAttribute(target.constructor, new IndexAttribute(
            propertyKey, // Attr name
            true, // Is Primary?
            options?.searchable ?? false,
            options?.filterable,
            options?.sortable,
            options?.displayable
        ));
    };
}