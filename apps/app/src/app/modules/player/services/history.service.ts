import { Injectable } from "@angular/core";
import { PlayerItem } from "../entities/player-item.entity";

@Injectable({
    providedIn: "root"
})
export class AppHistoryService {

    private readonly _history: PlayerItem[] = [];
    private _internalHistoryPointer: number = -1;

    /**
     * Check if the history is active. It is considered active
     * when the pointer is at position larger than -1
     * @returns True or False
     */
    public isActive(): boolean {
        return this._internalHistoryPointer > -1;
    }

    public isEmpty(): boolean {
        return this._history.length <= 0;
    }

    /**
     * Move one item back in history.
     * This will increment the history pointer and returns
     * the item at that position.
     * NOTE: Remember to properly reset the history pointer if not used anymore
     * @returns PlayerItem
     */
    public backward(): PlayerItem {
        this.increment();       

        // Return item at current position
        return this.get();
    }


    public forward(): PlayerItem {
        this.decrement();

        // Return item at current position
        return this.get();
    }  

    /**
     * Reset current pointer position in history to start
     * at the latest item that was added.
     */
    public resetPointer() {
        this._internalHistoryPointer = -1;
    }

    /**
     * Get the item at the current pointer position
     * @returns PlayerItem
     */
    public get(): PlayerItem {
        return this._history[this._internalHistoryPointer];
    }

    /**
     * Get item at a specific position in history.
     * @param index Index as number (max. 30 or history length)
     * @returns PlayerItem
     */
    public getAt(index: number): PlayerItem {
        if(index >= this._history.length || index < 0) return null;
        return this._history[index];
    }

    /**
     * Add an item to the history. If history would exceed 30 items,
     * the first added item is removed (FIFO)
     * @param item Item data to add
     */
    public add(item: PlayerItem) {
        if(item.fromHistory) {
            // Do not add history items again to history
            return;
        }

        // Set fromHistory flag
        const historyItem = new PlayerItem(item.song, item.tracklist, true);

        if(this._history.length >= 30) {
            // Delete first item
            this._history.splice(this._history.length - 1, 1);
        }

        // Add item to history
        this._history.unshift(historyItem);
        console.log("added to history", this._history);

        if(this.isActive()) {
            // Because item gets pushed
            this.increment();
        }
    }

    /**
     * Clear history.
     * This resets history as well as pointer position
     */
    public clear() {
        this.resetPointer();
        this._history.splice(0, this._history.length);
    }

    private increment() {
        // Increment pointer position
        this._internalHistoryPointer++;

        // Check that pointer does not get larger than history length
        if(this._internalHistoryPointer >= this._history.length) {
            this._internalHistoryPointer = this._history.length - 1;
        }
    }

    private decrement() {
        // Increment pointer position
        this._internalHistoryPointer--;
        
        // Check that pointer does not get less than -1
        if(this._internalHistoryPointer < -1) {
            this._internalHistoryPointer = -1;
        }
    }

}