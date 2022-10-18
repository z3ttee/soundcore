
export class CreationBatchResult<T = any> {

    constructor(
        public readonly created: T[],
        public readonly existed: T[]
    ) {}

}