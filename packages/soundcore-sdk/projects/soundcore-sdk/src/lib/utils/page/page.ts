export class Page<T> {
    /**
     * Total amount of available pages for that query.
     * This value is calculated via totalElements/requestedSize.
     */
    public readonly totalPages: number;
    /**
     * The requested page size.
     */
    public readonly requestedSize: number;
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
        public readonly requestedPage: number, 
        /**
         * List of found elements
         */
        public readonly elements: T[]
    ) {
        this.requestedSize = elements.length;
        this.totalPages = Math.ceil((totalElements || 0) / (this.requestedSize || 1));
        this.size = elements.length;
    }

    /**
     * Create new page result.
     * @param elements Results of the page
     * @param totalElements Available items available in total
     * @param requestedPage Requested page index
     * @returns Page<Type>
     */
    public static of<Type>(elements: Type[], totalElements?: number, requestedPage: number = 0): Page<Type> {
        return new Page<Type>(totalElements || elements.length, requestedPage || 0, elements);
    }
}
