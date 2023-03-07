import { IndexObject } from "meilisearch";

export class MeiliIndex<T = any> {

    constructor(
        protected readonly metadata: IndexObject,
        protected readonly schema: T
    ) {}
    
}