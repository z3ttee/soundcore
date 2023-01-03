export class Page<T> {
    /**
     * The current size of the page, indicating
     * how many items were for found for the 
     * requested page
     */
    public readonly size: number;

    constructor(
        /**
         * Available items available in total via
         * the executed query.
         */
        public readonly totalElements: number, 
        /**
         * Requested page index
         */
        public readonly requestedOffset: number, 
        /**
         * List of found elements
         */
        public readonly elements: T[]
    ) {
        this.size = elements.length;
    }

    /**
     * Create new page result.
     * @param elements Results of the page
     * @param totalElements Available items available in total
     * @param requestedPage Requested page index
     * @returns Page<Type>
     */
    public static of<Type>(elements: Type[], totalElements?: number, requestedOffset: number = 0): Page<Type> {
        return new Page<Type>(totalElements || elements.length, requestedOffset || 0, elements);
    }
}
