import sizeof from "object-sizeof";
import { debounceTime, Subject } from "rxjs";
import { workerEmit } from "workerpool";
import { DEFAULT_STATUS_EVENT_DEBOUNCE_MS } from "../constants";
import { Outputs, PipelineLogger } from "../entities/common.entity";
import { IPipeline, PipelineRun } from "../entities/pipeline.entity";
import { Stage } from "../entities/stage.entity";
import { Step } from "../entities/step.entity";
import { EventHandlerParams, EventName, WorkerEmitEvent } from "../event/event";

export class PipelineGlobal {
    definition: IPipeline;
    pipeline: PipelineRun;
    stage: Stage;
    step: Step;
    outputs: Outputs = {};
    sharedOutputs: Outputs = {}
    logger: PipelineLogger;
    statusEventDebounceMs: number = DEFAULT_STATUS_EVENT_DEBOUNCE_MS
}

const globals = new PipelineGlobal();
export let globalThis = globals;

export function resetGlobals() {
    const logger = globalThis.logger;
    const memUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    logger.info(`Process is using ${Math.round(memUsed * 100) / 100} MB of memory.`);

    delete globalThis.sharedOutputs;
    delete globalThis.outputs;
    globalThis = new PipelineGlobal();

    logger.info(`Memory usage after clearing unused data: ${Math.round(memUsed * 100) / 100} MB`);
}

const collectedStatusEvents: Map<string, Subject<EventHandlerParams<"status">>> = new Map();
const statusEventSubject = new Subject<EventHandlerParams<"status">>();
const statusEvent = statusEventSubject.asObservable();

statusEvent.subscribe((eventParams) => {
    const pipeline = eventParams[0].pipeline;
    let subject: Subject<EventHandlerParams<"status">>;

    if(!collectedStatusEvents.has(pipeline.id)) {
        const debounceMs = Math.max(0, getDebounceMs());

        subject = new Subject();
        collectedStatusEvents.set(pipeline.id, subject);

        subject.pipe(debounceTime(debounceMs)).subscribe((args) => {
            emitDebouncedStatus(args);
        });
    } else {
        subject = collectedStatusEvents.get(pipeline.id);
    }

    subject.next(eventParams);
});

function getDebounceMs() {
    return globalThis.statusEventDebounceMs ?? 0;
}

/**
 * Emit a message in a pipeline.
 * This can be used to emit custom events.
 * The emitted message can be handled by registering an event handler
 * for the "pipeline:message" event
 * @param message Message to emit
 */
export function message(message: string) {
    if(!globalThis.pipeline) {
        throw new Error(`Message was emitted outside the scope of a pipeline.`);
    }

    emit("message", message, {
        pipeline: globalThis.pipeline
    });
}

/**
 * Emit progress event for a step.
 * Note: Can only be used inside a step context
 * @param progress Progress value to emit
 */
export function progress(progress: number) {
    const step: Step = globalThis.step;
    const stage: Stage = globalThis.stage;
    const pipeline: PipelineRun = globalThis.pipeline;

    if(!step || !stage || !pipeline) {
        throw new Error(`Progress was emitted outside the scope of step in a pipeline.`);
    }

    step.progress = progress;

    globalThis.logger?.info(`Step '${step.id}' posted progress: ${progress}`);
    emit("status", { pipeline: pipeline });
}

/**
 * Emit an event
 * @param eventName Name of the event to emit
 * @param args Parameters to pass to handler
 */
export function emit<T extends EventName>(eventName: T, ...args: EventHandlerParams<T>) {

    if(eventName === "status") {
        debounceStatus((args as EventHandlerParams<"status">));
    } else {
        workerEmit({ name: eventName, args } as WorkerEmitEvent<T>);
    }

}

function debounceStatus(args: EventHandlerParams<"status">) {
    statusEventSubject.next(args);
}

function emitDebouncedStatus(args: EventHandlerParams<"status">) {
    workerEmit({ name: "status", args: args } as WorkerEmitEvent<"status">);
}

/**
 * Write a value to the output of the current pipeline step.
 * @param key Key to write to
 * @param value Value to write
 * @returns Written value
 */
export function set<T = any>(key: string, value: T) {
    const step: Step = globalThis.step;
    const stage: Stage = globalThis.stage;
    const pipeline: PipelineRun = globalThis.pipeline;

    if(!step || !stage || !pipeline) {
        throw new Error(`set() was called outside the scope of step in a pipeline.`);
    }

    const outputsMemSize = sizeof(globalThis.outputs);
    const valueMemSize = sizeof(value);
    globalThis.logger?.info(`Writing ${valueMemSize} bytes to output (Total: ${valueMemSize+outputsMemSize} bytes)`);

    return writeOutput<T>(pipeline, `${stage.id}.${step.id}.${key}`, value);
}

/**
 * Write a value to the shared output of the current pipeline.
 * @param key Key to write to
 * @param value Value to write
 * @returns Written value
 */
export function setShared<T = any>(key: string, value: T) {
    const outputsMemSize = sizeof(globalThis.sharedOutputs);
    const valueMemSize = sizeof(value);
    globalThis.logger?.info(`Writing ${valueMemSize} bytes to shared output (Total: ${valueMemSize+outputsMemSize} bytes)`);

    globalThis.sharedOutputs[key] = value;
    return value;
}

/**
 * Get a value by the path in the pipelines-outputs object
 * Usage: 
 *  <stage-id>.<step-id>.key - Reads a key-value pair from a step in a specific stage
 *  <step-id>.key - Reads a key-value pair from a step in the same stage
 *  key - Reads a key-value pair from the current step
 * @param path Path to the value
 */
export function get<T = any>(path: string) {
    return getOrDefault<T>(path, undefined);
}

/**
 * Get a value by the path in the pipelines-outputs object
 * Usage: 
 *  <stage-id>.<step-id>.key - Reads a key-value pair from a step in a specific stage
 *  <step-id>.key - Reads a key-value pair from a step in the same stage
 *  key - Reads a key-value pair from the current step
 * @param path Path to the value
 * @param defaultValue Default value to return
 */
export function getOrDefault<T = any>(path: string, defaultValue: T) {
    const pipeline: PipelineRun = globalThis.pipeline;

    if(!pipeline) {
        throw new Error(`GetOrDefault() was called outside the scope of a pipeline.`);
    }
    return readOutput<T>(pipeline, path, defaultValue);
}

/**
 * Get a value by the key in the pipelin's shared outputs object
 * @param key Key of the value
 * @param defaultValue Default value to return
 */
export function getSharedOrDefault<T = any>(key: string, defaultValue?: T) {
    const shared = globalThis.sharedOutputs ?? {};
    return shared[key] ?? defaultValue ?? undefined;
}

function writeOutput<T = any>(pipeline: PipelineRun, path: string, value: T) {
    const parts = path.split(".");

    let currentObj = globalThis.outputs;
    for(let index = 0; index < parts.length; index++) {
        const key = parts[index];

        // Check if last key has been reached
        if(index == parts.length - 1) {
            // If true, set value to object
            currentObj[key] = value;
            return value;
        }

        // Otherwise get nested object or create it
        if(typeof currentObj[key] === "undefined" || currentObj[key] == null) {
            // Instantiate new nested object if it is null
            currentObj[key] = {};
        }

        // If nested object now exists, continue into next nested object
        currentObj = currentObj[key];
    }
}

function readOutput<T = any>(pipeline: PipelineRun, path: string, defaultValue: T): T {
    const parts = path.split(".");

    let currentObj = {...globalThis.outputs};
    for(let index = 0; index < parts.length; index++) {
        const key = parts[index];

        // Check if last key has been reached
        if(index == parts.length - 1) {
            // If true, return value on the current object at that key
            return currentObj[key] ?? defaultValue ?? undefined;
        }

        // If there is no nested object, but the path requires one, return undefined or defaultValue
        if(typeof currentObj[key] === "undefined" || currentObj[key] == null) {
            return defaultValue ?? undefined
        }

        // If nested object exists, continue into next nested object
        currentObj = currentObj[key];
    }
}