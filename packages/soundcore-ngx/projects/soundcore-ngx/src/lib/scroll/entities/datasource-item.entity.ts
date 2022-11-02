
export class DatasourceItem<T = any> {
    constructor(
        public readonly index: number,
        public readonly data: T
    ) {}
}