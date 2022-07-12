
export class ApiError {

    constructor(
        public readonly statusCode: number,
        public readonly message: string,
        public readonly error: string
    ) {}

}