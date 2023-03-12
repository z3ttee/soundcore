import { IndexSchemaResolver } from "../definitions";

export class IndexAttribute {

    constructor(
        public readonly attrName: string,
        public readonly isPrimary: boolean = false,
        public readonly searchable: boolean = true,
        public readonly filterable: boolean = false,
        public readonly sortable: boolean = false,
        public readonly displayable: boolean = true,
    ) {}

}

export type IndexAttributeRelationType = "one" | "many"

export class IndexAttributeRelation {

    constructor(
        public readonly attrName: string,
        public readonly type: IndexAttributeRelationType,
        private readonly relationSchemaResolver: IndexSchemaResolver
    ) {}

    public get relationSchema() {
        return this.relationSchemaResolver();
    }

}