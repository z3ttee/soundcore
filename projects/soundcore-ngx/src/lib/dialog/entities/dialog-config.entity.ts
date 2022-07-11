
export class DialogConfig<D = any> {

    constructor(
        public readonly data?: D,
        public readonly fullscreen?: boolean,
        public readonly title?: string,
        public readonly message?: string
    ) {}

}