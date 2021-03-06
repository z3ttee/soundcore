export class Page<T> {
    public totalElements: number;
    public totalPages: number;
    public amount: number;
    public activePage: number;
    public activePageSize: number;
    public elements: T[];

    constructor(totalElements: number, activePage: number, elements: T[]) {
        this.totalElements = totalElements;
        this.activePageSize = elements.length;
        this.totalPages = Math.ceil((totalElements || 0) / (this.activePageSize || 1));
        this.elements = elements;
        this.amount = elements.length;
        this.activePage = activePage;
    }

    public static of<Type>(elements: Type[], totalElements?: number, activePage?: number): Page<Type> {
        return new Page<Type>(totalElements || elements.length, activePage || 0, elements);
    }
}