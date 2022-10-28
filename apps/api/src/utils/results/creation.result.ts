
export class CreateResult<T> {

    constructor(
        public readonly data: T,
        public readonly existed: boolean
    ) {}

}