
export enum LogLevel {
    INFO = 0,
    WARN = 1,
    DEBUG = 2,
    VERBOSE = 3,
    ERROR = 4
}

export class Logger {

    constructor(public readonly name: string) {}

    public log(message: string, ...args: any[]) {
        this.logMessage(LogLevel.INFO, message, args);
    }

    public warn(message: string, ...args: any[]) {
        this.logMessage(LogLevel.WARN, message, args);
    }

    public debug(message: string, ...args: any[]) {
        this.logMessage(LogLevel.DEBUG, message, args);
    }

    public verbose(message: string, ...args: any[]) {
        this.logMessage(LogLevel.VERBOSE, message, args);
    }

    public error(message: string, ...args: any[]) {
        this.logMessage(LogLevel.ERROR, message, args);
    }

    private logMessage(level: LogLevel, message: string, ...args: any[]) {
        if(level == LogLevel.INFO) {
            console.log(`%c[${this.name.toUpperCase()}] %c${message}`, 'color: orange', 'color: initial', ...args || undefined);
        } else if(level == LogLevel.WARN) {
            console.warn(`%c[${this.name.toUpperCase()}] %c${message}`, 'color: orange', 'color: initial', ...args || undefined);
        } else if(level == LogLevel.DEBUG) {
            console.debug(`%c[${this.name.toUpperCase()}] %c${message}`, 'color: orange', 'color: purple', ...args || undefined);
        } else if(level == LogLevel.VERBOSE) {
            console.log(`%c[${this.name.toUpperCase()}] %c${message}`, 'color: orange', 'color: cyan', ...args || undefined);
        } else if(level == LogLevel.ERROR) {
            console.error(`%c[${this.name.toUpperCase()}] %c${message}`, 'color: orange', 'color: red', ...args || undefined);
        }
    }

}