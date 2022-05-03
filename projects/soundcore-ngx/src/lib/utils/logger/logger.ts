
export class SCNGXLogger {

    constructor(
        private readonly name: string
    ) {}

    public log(message: string, ...args: any[]) {
        console.log(`[${this.name}] ${message}`, ...args)
    }

}