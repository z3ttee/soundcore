
export type BatchingHandler<I = any, T = I> = (batch: I[], batchNr?: number, maxBatches?: number) => Promise<T[]> | T[];
export type ErrorHandler = (batchNr: number, error: Error) => Promise<void> | void;
export type ThenHandler<T> = (result: T[]) => Promise<void> | void;
export type ProgressHandler = (batches: number, current: number) => Promise<void> | void;

export class Batch<I = any, R = I> {

    private _handler?: BatchingHandler<I, R>;
    private _errorHandler?: ErrorHandler;
    private _thenHandler?: ThenHandler<R>;
    private _progressHandler?: ProgressHandler;

    constructor(
        private readonly list: I[],
        private readonly batchSize: number = 100
    ) {}

    public static of<T = any, R = T>(list: T[], batchSize: number = 100): Batch<T, R> {
        return new Batch<T, R>(list, batchSize);
    }

    public do(handler: BatchingHandler<I, R>) {
        this._handler = handler;
        return this;
    }

    public catch(handler: ErrorHandler) {
        this._errorHandler = handler;
        return this;
    }

    public then(handler: ThenHandler<R>) {
        this._thenHandler = handler;
        return this;
    }

    public progress(handler: ProgressHandler) {
        this._progressHandler = handler;
        return this;
    }

    public async start(): Promise<R[]> {
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
            const batches = Math.round(list.length / this.batchSize);
    
            while(length) {
                currentBatch++;

                // Get batch from list
                const size = length >= this.batchSize ? this.batchSize : length;                      
                if(size <= 0) break;
                
                const batch = list.splice(0, size);
    
                // Build executer
                const runHandler = async () => {
                    return this._handler(batch, currentBatch, batches);
                }
    
                // Execute handler and get result.
                const resultBatch = await runHandler().catch((error: Error) => {
                    if(typeof this._errorHandler === "function") {
                        this._errorHandler(currentBatch, error);
                    }
    
                    return [] as R[];
                });
    
                // Push to results
                result.push(...resultBatch);

                // Execute progress
                if(typeof this._progressHandler === "function") {
                    this._progressHandler(batches, currentBatch);
                }
    
                // Decrement length to process next batch
                length -= size;
            }
    
            // At the end, execute result handler
            if(typeof this._thenHandler === "function") {
                this._thenHandler(result);
            }

            // Resolve promise as an alternative for using thenHandler
            resolve(result);
        })
    }

}