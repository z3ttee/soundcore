
export type BatchingHandler<I = any, T = I> = (batch: I[]) => Promise<T[]> | T[];
export type ErrorHandler = (batchNr: number, error: Error) => Promise<void> | void;
export type ThenHandler<T> = (result: T[]) => Promise<void> | void;
export type ProgressHandler = (batches: number, current: number) => Promise<void> | void;

export class Batching<I = any, R = I> {

    private _handler?: BatchingHandler<I, R>;
    private _errorHandler?: ErrorHandler;
    private _thenHandler?: ThenHandler<R>;
    private _progressHandler?: ProgressHandler;

    constructor(
        private readonly list: I[],
        private readonly batchSize: number = 100
    ) {}

    public static of<T = any, R = T>(list: T[], batchSize: number = 100): Batching<T, R> {
        return new Batching<T, R>(list, batchSize);
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
            let size = list.length >= this.batchSize ? this.batchSize : list.length;
    
            const result: R[] = [];
    
            // These are used to give some stats to the progress handler
            const batches = Math.round(size / this.batchSize);
            let currentBatch = 0;
    
            while(size) {
                currentBatch++;

                // Get batch from list
                const batch = list.splice(0, size);
    
                // Build executer
                const runHandler = async () => {
                    return this._handler(batch);
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
    
                // Decrement size, so that the while loop actually ends
                --size;
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