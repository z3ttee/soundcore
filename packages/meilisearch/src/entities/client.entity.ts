import MeiliSearch, { Config, Index, IndexesResults, IndexObject, Pagination } from "meilisearch";
import { IndexSchema } from "../definitions";
import { SchemaService } from "../services/schema.service";
import { createMeiliIndex } from "../utils/asyncProvider";
import { MeiliIndex } from "./index.entity";

export class MeiliClient extends MeiliSearch {
    public readonly schemas: SchemaService;

    constructor(
        config: Config,
        indexSchemas: IndexSchema[]
    ) {
        super(config);
        this.schemas = new SchemaService(indexSchemas);
    }

    public getIndexFromSchema(schema: IndexSchema): MeiliIndex {
        return createMeiliIndex(this.config, schema) as MeiliIndex<any>;
    }

    public index<T extends Record<string, any> = Record<string, any>>(indexUid: string): MeiliIndex<T> {
        return createMeiliIndex(this.config, this.schemas.get(indexUid)) as MeiliIndex<any>;
    }

    public async getIndex<T extends Record<string, any> = Record<string, any>>(indexUid: string): Promise<MeiliIndex<T>> {
        return this.index<T>(indexUid).fetchInfo()
    }

    public async getIndexes(parameters?: Pagination): Promise<IndexesResults<MeiliIndex[]>> {
        const rawIndexes = await this.getRawIndexes(parameters);
        const indexes: MeiliIndex[] = [];

        rawIndexes.results.forEach((indexObject) => {
            if(!this.schemas.has(indexObject.uid)) return;
            const index = createMeiliIndex(this.config, this.schemas.get(indexObject.uid));
            indexes.push(index);
        });
        
        return { ...rawIndexes, results: indexes }
    }

    public async buildRawIndex(obj: IndexObject) {
        return new Index(this.config, obj.uid, obj.primaryKey);
    }
    
}