import { v4 as uuidv4 } from "uuid";

class CacheItem<T = any> {

    public readonly id: string;

    constructor(
        public data: T
    ) {
        this.id = data?.["id"] ?? uuidv4();
    }

}

export class PageCache<T = any> {

    /**
     * Stores a boolean value to a pageIndex.
     * If true, the page counts as cached, otherwise
     * not.
     */
    private readonly _pages: boolean[] = [];

    /**
     * Stores the list of cached items.
     */
    private readonly _items: CacheItem<T>[] = [];

    /**
     * Stores a boolean that says if a key is stored or not
     */
    private readonly _registeredIds: Map<string, boolean> = new Map();

    constructor(
        /**
         * The utilized size of each page.
         */
        public readonly pageSize: number
    ) {}

    /**
     * Set the contents of a page in the cache.
     * This will register the page in the cache.
     * @param pageIndex Index of the page
     * @param contents Elements of the page
     */
    public async setPage(pageIndex: number, contents: T[]) {
        const start = Date.now();
        const startIndex = pageIndex * this.pageSize;

        for(let i = 0; i < contents.length; i++) {
            const item = contents[i];
            this._items[startIndex + i] = new CacheItem(item) ?? null;
        }

        const end = Date.now();
        console.log(`Set cached page. Took ${end-start}ms.`);

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
        const start = Date.now();
        const rawItems =this.getPageItems(pageIndex);
        const items = rawItems.map((item) => item.data);
        const end = Date.now();

        console.log(`Returned cached page. Took ${end-start}ms. Size: ${items.length}`);
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
        const cachedItem = new CacheItem(item);
        this._items.push(cachedItem);
        this._registeredIds.set(cachedItem.id, true);
    }

    /**
     * Prepend an item to the cache
     * @param item Item to prepend
     */
    public async prepend(item: T) {
        const cachedItem = new CacheItem(item);
        this._items.unshift(cachedItem);
        this._registeredIds.set(cachedItem.id, true);
    }

    /**
     * Replace an item at an index.
     * @param index Index to replace at
     * @param item Item data to set
     */
    public async replaceAt(index: number, item: T) {
        const cachedItem = this._items[index];
        cachedItem.data = item;
        this._items[index] = cachedItem;
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
    public async appendOrReplace(item: T): Promise<{ wasAppended: boolean, item: CacheItem<T> }> {
        const cacheItem = new CacheItem(item);

        // Replace item if it exists
        if(this.hasById(cacheItem.id)) {
            return this.replaceAtId(cacheItem.id, cacheItem.data).then(() => ({
                wasAppended: false,
                item: cacheItem
            }));
        }

        // Otherwise append
        this._items.push(new CacheItem(item));
        return {
            wasAppended: false,
            item: cacheItem
        };
    }

    /**
     * Get an item by its index
     * @param index Index in the cache
     * @returns T
     */
    public async getByIndex(index: number): Promise<T> {
        const item = this._items[index] ?? null;
        return item?.data ?? null;
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
        const start = Date.now();

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

        const end = Date.now();
        console.log(`Translated itemId to index. Took ${end-start}ms.`);
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
        console.log("Registered page in cache.");
    }

    /**
     * Unregister a page from the cache
     * @param pageIndex Index of the page
     */
    private unregisterPage(pageIndex: number) {
        // TODO: Test
        //this._pages[pageIndex] = false;
        // console.log("Unregistered page from cache.");
    }

    /**
     * Get the contents of a cached page.
     * The difference is, that it is slightly more performant than getPage(),
     * but does not return the raw items but returned wrapped items in CacheItem<T>.
     * @param pageIndex Index of the page
     * @returns CacheItem<T>[]
     */
    private getPageItems(pageIndex: number): CacheItem<T>[] {
        if(!this.hasPage(pageIndex)) return [];

        const startIndex = pageIndex * this.pageSize;
        return this._items.slice(startIndex, startIndex + this.pageSize - 1);
    }

}