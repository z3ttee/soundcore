import { Config, DocumentOptions, EnqueuedTask, Index, IndexObject } from "meilisearch";
import { IndexSchema } from "../definitions";
import { filterDocument } from "../utils/documentBuilder";
import { getAllSchemaAttributes, getSchemaAttributes, getSchemaRelations } from "../utils/reflectUtils";

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

    /**
     * Prepare the object for transfer to meilisearch.
     * This will parse nested objects and will only include annotated properties
     * @param document 
     * @returns Modified and filtered object
     */
    private buildDocument(document: T | Partial<T>): T {
        const attributes = getAllSchemaAttributes(this.schema as IndexSchema);
        const includedProps = Array.from(attributes.keys());
        return filterDocument<T>(document, includedProps);
    }
    
}