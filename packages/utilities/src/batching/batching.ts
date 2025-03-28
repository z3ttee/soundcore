
export type BatchingHandler<I = any, T = I> = (batch: I[], currentBatch?: number, totalBatches?: number) => Promise<T[]> | T[];
export type MapBatchingHandler<I = any, T = I> = (batch: I[], currentBatch?: number, totalBatches?: number) => Promise<Map<string, T>> | Map<string, T>;
export type ErrorHandler<I = any> = (error: Error, batch: I[], batchNr: number) => Promise<void> | void;

abstract class BaseBatch<I = any> {
    private _errorHandler?: ErrorHandler<I>;

    public onError(handler: ErrorHandler<I>) {
        this._errorHandler = handler;
        return this;
    }

    protected pushError(error: Error, batch: I[], batchNr: number) {
        if(typeof this._errorHandler !== "function") return;
        this._errorHandler(error, batch, batchNr);
    }

}

export class Batch<I = any, R = I> extends BaseBatch<I> {
    private _handler?: BatchingHandler<I, R>;
    private _mapHandler?: MapBatchingHandler<I, R>;

    constructor(
        private readonly list: I[],
        private readonly batchSize: number = 100
    ) {
        super();
    }

    /**
     * Initialize batching process.
     * @param list Dataset to make batches of
     * @param batchSize Size of each batch, defaults to 100
     * @returns Batch<T, R>
     */
    public static useDataset<T = any, R = T>(list: T[], batchSize?: number): Batch<T, R> {
        return new Batch<T, R>(list, batchSize ?? 100);
    }

    public forEach(handler: BatchingHandler<I, R>): Promise<R[]> {
        this._handler = handler;
        return this.start();
    }

    public map(handler: MapBatchingHandler<I, R>) {
        this._mapHandler = handler;
        return this.startMap();
    }

    private async start() {
        return new Promise<R[]>(async (resolve) => {
            if(typeof this._handler !== "function") {
                throw new Error("Handler for batching process must be a valid function.");
            }
    
            // If there are no BATCH_SIZE entries left, use current length
            const list = this.list ?? [];
            const result: R[] = [];
    
            // These are used to give some stats to the progress handler
            let currentBatch = 0;
            let length = list.length;

            // Get amount of batches to process (used for stats and progress)
            const totalBatches = Math.ceil(list.length / this.batchSize);
    
            while(length) {
                currentBatch++;

                // Get batch from list
                const size = length >= this.batchSize ? this.batchSize : length;                      
                if(size <= 0) break;
                
                const batch = list.splice(0, size);
    
                // Build executer
                const runHandler = async () => {
                    return this._handler(batch, currentBatch, totalBatches);
                }
    
                // Execute handler and get result.
                const resultBatch = await runHandler().catch((error: Error) => {
                    this.pushError(error, batch, currentBatch);
                    return [] as R[];
                });
    
                // Push to results
                result.push(...resultBatch);
    
                // Decrement length to process next batch
                length -= size;
            }


            // Resolve promise as an alternative for using thenHandler
            resolve(result);
        })
    }

    private async startMap() {
        return new Promise<Map<string, R>>(async (resolve) => {
            if(typeof this._mapHandler !== "function") {
                throw new Error("Handler for batching process must be a valid function.");
            }
    
            // If there are no BATCH_SIZE entries left, use current length
            const list = this.list ?? [];
            let result: Map<string, R> = new Map();
    
            // These are used to give some stats to the progress handler
            let currentBatch = 0;
            let length = list.length;

            // Get amount of batches to process (used for stats and progress)
            const totalBatches = Math.ceil(list.length / this.batchSize);
    
            while(length) {
                currentBatch++;

                // Get batch from list
                const size = length >= this.batchSize ? this.batchSize : length;                      
                if(size <= 0) break;
                
                const batch = list.splice(0, size);
    
                // Build executer
                const runHandler = async () => {
                    return this._mapHandler(batch, currentBatch, totalBatches);
                }
    
                // Execute handler and get result.
                const resultBatch: Map<string, R> = await runHandler().catch((error: Error) => {
                    this.pushError(error, batch, currentBatch);
                    return null;
                });

                if(typeof resultBatch !== "undefined" && resultBatch != null){
                    // Push to results
                    result = new Map([...Array.from(result.entries()), ...Array.from(resultBatch.entries())]);
                }
                
                // Decrement length to process next batch
                length -= size;
            }

            // Resolve promise as an alternative for using thenHandler
            resolve(new Map(result));
        })
    }

}