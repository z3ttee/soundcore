
export class ApiSearchResponse<T> {

    constructor(
        public readonly estimatedTotalHits: number,
        public readonly hits: T[],
        public readonly limit: number,
        public readonly offset: number,
        public readonly processingTime: number,
        public readonly query: string
    ) {}

}