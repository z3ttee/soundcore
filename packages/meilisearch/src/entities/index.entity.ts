import { Config, DocumentOptions, EnqueuedTask, Index, IndexObject } from "meilisearch";
import { REFLECT_MEILIINDEX_INCLUDED_PROPS } from "../constants";

export class MeiliIndex<T = any> extends Index<T> {

    constructor(
        config: Config, 
        uid: string,
        primaryKey: string,
        protected readonly schema: T,
        metadata?: IndexObject,
    ) {
        super(config, metadata?.uid ?? uid, metadata?.primaryKey ?? primaryKey);

        this.createdAt = metadata?.createdAt;
        this.updatedAt = metadata?.updatedAt;
    }

    public async addDocuments(documents: T[], options?: DocumentOptions): Promise<EnqueuedTask> {
        return super.addDocuments(documents.map((document) => this.buildDocument(document)), options);
    }

    public async addDocumentsInBatches(documents: T[], batchSize?: number, options?: DocumentOptions): Promise<EnqueuedTask[]> {
        return super.addDocumentsInBatches(documents.map((document) => this.buildDocument(document)), batchSize, options);
    }

    public async updateDocuments(documents: Partial<T>[], options?: DocumentOptions): Promise<EnqueuedTask> {
        return super.updateDocuments(documents.map((document) => this.buildDocument(document)), options);
    }

    public async updateDocumentsInBatches(documents: Partial<T>[], batchSize?: number, options?: DocumentOptions): Promise<EnqueuedTask[]> {
        return super.updateDocumentsInBatches(documents.map((document) => this.buildDocument(document)), batchSize, options);
    }

    private buildDocument(document: T | Partial<T>): T {
        const whitelistedProps: string[] = Reflect.getMetadata(REFLECT_MEILIINDEX_INCLUDED_PROPS, this.schema) ?? [];
        const result = Object.fromEntries(Object.entries(document).filter(([key, _]) => whitelistedProps.includes(key))) as unknown as T;
        return result;
    }
    
}