import { isUndefined, pascalToSnakeCase } from "@soundcore/common";
import { Faceting, TypoTolerance } from "meilisearch";
import { REFLECT_MEILIINDEX_OPTIONS } from "../constants";

export interface IndexOptions {
    uid?: string;
    faceting?: Faceting;
    typoTolerance?: TypoTolerance;
}

export function IndexEntity(): ClassDecorator;
export function IndexEntity(uid: string);
export function IndexEntity(options: IndexOptions);
export function IndexEntity(uidOrOptions?: string | IndexOptions): ClassDecorator {
    let options: IndexOptions = {}

    if(!isUndefined(uidOrOptions)) {
        if(typeof uidOrOptions === "string") {
            options.uid = uidOrOptions;
        } else {
            options = uidOrOptions;
        }
    }

    return (target: object) => {
        if(isUndefined(options.uid)) {
            options.uid = pascalToSnakeCase(target["name"]);
        }

        Reflect.defineMetadata(REFLECT_MEILIINDEX_OPTIONS, options, target);
    };
}