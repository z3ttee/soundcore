import { Page, PageInfo, isNull } from "@soundcore/common";

export type CachedPage = Pick<Page, "length" | "nextOffset" | "prevOffset" | "totalSize">

export class Cache<T = any> {

    private readonly pages: Set<number> = new Set();
    private readonly infos: Map<number, PageInfo> = new Map();
    private readonly cache: T[] = [];

    private _lastCachedPage: CachedPage;

    public get length() {
        return this.cache.length;
    }

    public get lastCachedPageInfo() {
        return this._lastCachedPage
    }

    public set(pageIndex: number, page: Page<T>) {
        if(this.has(pageIndex)) return;

        this.infos.set(pageIndex, page.info);
        this.cache.push(...page.items);
        this.pages.add(pageIndex);

        this._lastCachedPage = {
            length: page.length,
            nextOffset: page.nextOffset,
            prevOffset: page.prevOffset,
            totalSize: page.totalSize
        };
    }

    public get(pageIndex: number) {
        const infos = this.getPageInfo(pageIndex);
        if(isNull(infos)) return null;
        return this.cache.slice(infos.offset, infos.limit);
    }

    public getPageInfo(pageIndex: number) {
        return this.infos.get(pageIndex);
    }

    public has(pageIndex: number) {
        return this.pages.has(pageIndex) && this.infos.has(pageIndex);
    }

    public remove(pageIndex: number) {
        const infos = this.getPageInfo(pageIndex);
        if(isNull(infos)) return null;

        this.pages.delete(pageIndex);
        this.infos.delete(pageIndex);

        return this.cache.splice(infos.offset, infos.limit);
    }

    public clear() {
        this.pages.clear();
        this.infos.clear();
        this.cache.splice(0, this.cache.length);
    }

    public release() {
        this.clear();
    }

}