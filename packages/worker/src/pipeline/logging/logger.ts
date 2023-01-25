import path from "node:path";
import winston from "winston";

const colors = {
    black: "\u001b[30m",
    red: "\u001b[31m",
    green: "\u001b[32m",
    yellow: "\u001b[33m",
    blue: "\u001b[34m",
    magenta: "\u001b[35m",
    cyan: "\u001b[36m",
    white: "\u001b[37m",
    reset: "\u001b[0m"
}

function getLevelColor(level: string): string {
    const levelColorName = winston.config.npm.colors[level].toString().toLowerCase();
    return colors[levelColorName] ?? colors.reset;
}

function useConsoleFormat(pipelineId: string): winston.Logform.Format {
    return winston.format.combine(
        winston.format.metadata(),
        winston.format.ms(),
        winston.format.timestamp({ format: "DD.MM.YYYY, HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.label({ label: "[Pipeline]", message: false }),
        winston.format.printf(({ level, message, metadata, timestamp, ms, label }) => {
            const hasMetadata = Object.keys(metadata ?? null).length > 0;
            const color = getLevelColor(level);
            const reset = colors.reset;
            const yellow = colors.yellow;
            return `${color}${label} ${process.pid.toString().padEnd(5, " ")} - ${reset}${timestamp} ${color}${level.toUpperCase().padStart(7, " ")}${reset} ${yellow}[${pipelineId}]${reset} ${color}${message} ${yellow}${ms}${reset}${hasMetadata ? '\n'+JSON.stringify(metadata, null, 4) : ''}`;
        }),
    );
}

function useFileFormat(): winston.Logform.Format {
    return winston.format.combine(
        winston.format.metadata(),
        winston.format.ms(),
        winston.format.timestamp({ format: "DD.MM.YYYY, HH:mm:ss" }),
        winston.format.label({ label: "[Pipeline]", message: false }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    );
}

export function createLogger(pipelineId: string, pipelineRunId: string, enableConsoleLogging: boolean) {
    const cwd = process.cwd();

    const transports: winston.transport[] = [
        new winston.transports.File({
            dirname: path.join(cwd, "logs", "pipelines", pipelineId),
            filename: `${pipelineRunId}.log`,
            format: useFileFormat(),
        })
    ]

    if(enableConsoleLogging) transports.push(new winston.transports.Console({ format: useConsoleFormat(pipelineId) }));
    return winston.createLogger({ transports: transports, levels: winston.config.npm.levels });
}

export function createEmptyLogger() {
    return winston.createLogger({
        transports: [new winston.transports.Console({
            silent: true
        })]
    });
}