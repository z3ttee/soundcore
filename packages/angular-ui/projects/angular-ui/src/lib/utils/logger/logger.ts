
export class SCNGXLogger {

    constructor(
        private readonly name: string
    ) {}

    public log(message: string, ...args: any[]) {
        console.log(`[${this.name}] ${message}`, ...args)
    }

    public warn(message: string, ...args: any[]) {
        console.warn(`[${this.name}] ${message}`, ...args)
    }

    public debug(message: string, ...args: any[]) {
        console.debug(`[${this.name}] ${message}`, ...args)
    }

}