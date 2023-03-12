import { isUndefined, pascalToSnakeCase } from "@soundcore/common";
import { Faceting, TypoTolerance } from "meilisearch";
import { REFLECT_MEILIINDEX_OPTIONS } from "../constants";
import { setIndexOptions } from "../utils/reflectUtils";

export interface IndexOptions {
    uid?: string;
    faceting?: Faceting;
    typoTolerance?: TypoTolerance;
}

export function MeilisearchIndex(): ClassDecorator;
export function MeilisearchIndex(uid: string);
export function MeilisearchIndex(options: IndexOptions);
export function MeilisearchIndex(uidOrOptions?: string | IndexOptions): ClassDecorator {
    let options: IndexOptions = {}

    if(!isUndefined(uidOrOptions)) {
        if(typeof uidOrOptions === "string") {
            options.uid = uidOrOptions;
        } else {
            options = uidOrOptions;
        }
    }

    return (target) => {
        if(isUndefined(options.uid)) {
            options.uid = pascalToSnakeCase(target["name"]);
        }

        setIndexOptions(target, options);
    };
}