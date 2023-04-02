
export class QueuePointer {

    private _min: number;
    private _max: number;

    private _position: number;

    constructor(
        /**
         * Minimum position of the pointer in the queue
         */
        minimum: number = 0,
        /**
         * Maximum position of the pointer in the queue
         */
        maximum: number = minimum+1
    ) {
        this.setMin(minimum);
        this.setMax(maximum);
    }

    public get position(): number {
        return this._position ?? this._min;
    }

    public get max() {
        return this._max;
    }

    public get min() {
        return this._min;
    }

    public get reachedEnd() {
        return this._position >= this._max;
    }
    
    public inc(step?: number) {
        this.update(this._position + (step ?? 1));
    }

    public dec(step?: number) {
        this.update(this._position - (step ?? 1));
    }

    public setPosition(val: number) {
        this.update(val);
    }

    public reset() {
        this.setPosition(this._min);
    }

    public setMin(min: number) {
        this._min = Math.max(0, Math.min((this._max ?? 0), min));
    }

    public setMax(max: number) {
        this._max = Math.max((this._min ?? 0), max);
    }

    /**
     * When used in lists, this can be used to subtract the minimum
     * pointer index from the list index. The result is the exact index of the list's index
     * in pointer scope
     * @param index Index in the list
     * @returns Index in scopes of the pointer (between min and max)
     */
    public convert(index: number): number {
        return index - this._min;
    }

    /**
     * Convert index and set converted value as new pointer position
     * @param index Index to convert
     * @returns Index in scopes of the pointer (between min and max)
     */
    public convertAndSet(index: number): number {
        const converted = this.convert(index);
        this.setPosition(converted);
        return converted;
    }

    private update(val: number) {
        this._position = Math.max(this._min, Math.min(this._max, val));
    }

}