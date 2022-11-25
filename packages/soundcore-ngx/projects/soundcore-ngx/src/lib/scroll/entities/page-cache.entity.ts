export abstract class PageCacheItem {
    id: any;
}

export class PageCache<T extends PageCacheItem = any> {

    /**
     * Stores a boolean value to a pageIndex.
     * If true, the page counts as cached, otherwise
     * not.
     */
    private readonly _pages: boolean[] = [];

    /**
     * Stores the list of cached items.
     */
    private readonly _items: T[] = [];

    /**
     * Stores a boolean that says if a key is stored or not
     */
    private readonly _registeredIds: Map<string, boolean> = new Map();

    constructor(
        /**
         * The utilized size of each page.
         */
        public readonly pageSize: number,

        /**
         * Initialize the cache with a dataset
         */
        items?: T[]
    ) {
        this.setPagesFromDataset(items ?? []);
    }

    /**
     * Set the contents of a page in the cache.
     * This will register the page in the cache.
     * @param pageIndex Index of the page
     * @param contents Elements of the page
     */
    public async setPage(pageIndex: number, contents: T[]) {
        this.setPageSync(pageIndex, contents)
    }

    /**
     * Set the contents of a page in the cache.
     * This will register the page in the cache.
     * @param pageIndex Index of the page
     * @param contents Elements of the page
     */
    public setPageSync(pageIndex: number, contents: T[]) {
        const startIndex = pageIndex * this.pageSize;

        for(let i = 0; i < contents.length; i++) {
            const item = contents[i];
            this._items[startIndex + i] = item ?? null;
        }

        this.registerPage(pageIndex);
    }

    /**
     * Check if a page is already registered in the cache.
     * @param pageIndex Index of the page to check.
     * @returns True or False
     */
    public hasPage(pageIndex: number) {
        return this._pages[pageIndex] ?? false;
    }

    /**
     * Get the contents of a page.
     * @param pageIndex Index of the page
     * @returns T[]
     */
    public async getPage(pageIndex: number): Promise<T[]> {
        const items = this.getPageItems(pageIndex);
        return items;
    }

    /**
     * Clear the cache
     */
    public clear() {
        this._items.splice(0, this._items.length);
        this._pages.splice(0, this._pages.length);
    }

    /**
     * Remove an item by its id.
     * @param itemId Id of the item
     */
    public async removeById(itemId: string) {
        const index = await this.translateIdToIndex(itemId);
        return this.removeByIndex(index);
    }

    /**
     * Remove an item by its index.
     * @param index Index of the item in the cache
     */
    public async removeByIndex(index: number) {
        const item = this.getByIndex(index);
        if(typeof item === "undefined" || item == null) return;

        // Remove item
        const removed = this._items.splice(index, 1)?.[0];
        this._registeredIds.delete(removed?.id);

        // Check the remaining size of the page.
        // If the page is empty --> Unregister page
        const pageIndex = this.translateIndexToPage(index);
        const pageSize = this.getPageSize(pageIndex);
        if(pageSize <= 0) {
            this.unregisterPage(pageIndex);
        }
    }

    /**
     * Append an item to the cache
     * @param item Item to append
     */
    public async append(item: T) {
        const cachedItem = item;
        this._items.push(cachedItem);
        this._registeredIds.set(cachedItem.id, true);
    }

    /**
     * Prepend an item to the cache
     * @param item Item to prepend
     */
    public async prepend(item: T) {
        const cachedItem = item;
        this._items.unshift(cachedItem);
        this._registeredIds.set(cachedItem.id, true);
    }

    /**
     * Replace an item at an index.
     * @param index Index to replace at
     * @param item Item data to set
     */
    public async replaceAt(index: number, item: T) {
        this._items[index] = item;
    }

    /**
     * Replace an item by id. This will lookup the item's index
     * and replaces data at that position. Calls replaceAt() internally.
     * @param itemId Id of the item to replace
     * @param item Item data to set
     */
    public async replaceAtId(itemId: string, item: T) {
        const index = await this.translateIdToIndex(itemId);
        if(index == -1) return;

        return this.replaceAt(index, item);
    }

    /**
     * Append an item to the cache, if the item's id already exists, it will be replaced
     * @param item 
     * @returns True if was appended, if replaced it returns false
     */
    public async appendOrReplace(item: T): Promise<{ wasAppended: boolean, item: T }> {

        // Replace item if it exists
        if(this.hasById(item.id)) {
            return this.replaceAtId(item.id, item).then(() => ({
                wasAppended: false,
                item: item
            }));
        }

        // Otherwise append
        this._items.push(item);
        return {
            wasAppended: false,
            item: item
        };
    }

    /**
     * Get an item by its index
     * @param index Index in the cache
     * @returns T
     */
    public getByIndex(index: number): T {
        return this._items[index] ?? null;
    }

    /**
     * Translate an index to an index of a page.
     * @param index Index to translate
     * @returns number
     */
    public translateIndexToPage(index: number) {
        const startIndex = Math.max(index, 0);
        const startPage = Math.floor(startIndex / this.pageSize);
        return startPage;
    }

    /**
     * Check if an item by id already exists.
     * @param itemId Item's id
     * @returns True or False
     */
    public async hasById(itemId: string) {
        return this._registeredIds.has(itemId);
    }

    /**
     * Translate an item's id to an index in the cache.
     * @param itemId Id of the item
     * @returns number (-1 if item was not found)
     */
    public async translateIdToIndex(itemId: string): Promise<number> {
        if(!this.hasById(itemId)) {
            return -1;
        }

        let index = -1;
        for(let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            if(item?.id == itemId) {
                index = i;
                break;
            }
        }

        return index;
    }

    /**
     * Get the size of a cached page. (As items can get removed)
     * @param pageIndex Index of the page
     * @returns number
     */
    private getPageSize(pageIndex: number) {
        return this.getPageItems(pageIndex)?.length ?? 0;
    }

    /**
     * Register a page in the cache
     * @param pageIndex Index of the page
     */
    private registerPage(pageIndex: number) {
        this._pages[pageIndex] = true;
    }

    /**
     * Unregister a page from the cache
     * @param pageIndex Index of the page
     */
    private unregisterPage(pageIndex: number) {
        // TODO: Test
        //this._pages[pageIndex] = false;
    }

    /**
     * Get the contents of a cached page.
     * The difference is, that it is slightly more performant than getPage(),
     * but does not return the raw items but returned wrapped items in CacheItem<T>.
     * @param pageIndex Index of the page
     * @returns CacheItem<T>[]
     */
    private getPageItems(pageIndex: number): T[] {
        if(!this.hasPage(pageIndex)) return [];

        const startIndex = pageIndex * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // Remember: endIndex in slice is exclusive, so it does not get included
        return this._items.slice(startIndex, endIndex);
    }

    /**
     * Initialize this cache with a dataset
     * @param dataset List of items
     */
    private setPagesFromDataset(dataset: T[]) {
        if(dataset.length <= 0) return;
        const pages = Math.ceil(dataset.length / this.pageSize);

        for(let pageIndex = 0; pageIndex < pages; pageIndex++) {
            const startIndex = pageIndex * this.pageSize;
            const endIndex = startIndex + this.pageSize;

            // Remember: endIndex in slice is exclusive, so it does not get included
            const contents = dataset.slice(startIndex, endIndex);
            this.setPageSync(pageIndex, contents);
            this.registerPage(pageIndex);
        }
    }

}