import path from "node:path";
import winston from "winston";

export function createLogger(pipelineId: string, pipelineRunId: string) {
    const cwd = process.cwd();

    return winston.createLogger({
        format: winston.format.combine(
            winston.format.metadata(),
            winston.format.ms(),
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
            winston.format.prettyPrint()
        ),
        transports: [
            new winston.transports.File({
                dirname: path.join(cwd, "logs", "pipelines", pipelineId),
                filename: `${pipelineRunId}.log`
            })
        ]
    });
}